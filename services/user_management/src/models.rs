use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use serde::{Deserialize, Serialize};
use crate::db::AppState;
use rusqlite::params;
use rocket::State;
use rand::Rng;


#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: u64,
    pub username: String,
    pub password: String,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginCredentials {
    pub username: String,
    pub password: String,
}

pub async fn hash(password: &[u8]) -> String {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password, &salt)
        .expect("Unable to hash password.")
        .to_string()
}

impl User {
    pub async fn create(user_data: LoginCredentials, state: &State<AppState>) -> Result<User, String> {
        let hash = hash(user_data.password.as_bytes()).await;

        let user = User {
            id: rand::thread_rng().gen::<u64>(),
            username: user_data.username,
            password: hash,
            role: String::from("Test Role")
        };

        let username_exists: bool = {
            let conn = state.get_db_connection().map_err(|e| e.to_string())?;
            conn.query_row(
                "SELECT EXISTS(SELECT 1 FROM users WHERE username = ?1)",
                [&user.username],
                |row| row.get(0),
            ).map_err(|e| e.to_string())?
        };

        if username_exists {
            return Err(String::from("Username already exists."));
        }

        {
            let conn = state.get_db_connection().map_err(|e| e.to_string())?;
            conn.execute(
                "INSERT INTO users (id, username, password, role) VALUES (?1, ?2, ?3, ?4)",
                params![user.id, user.username, user.password, user.role],
            ).map_err(|e| e.to_string())?;
        }
        Ok(user)
    }

    pub async fn find_by_id(id: u64, state: &State<AppState>) -> Result<User, String> {
        let conn = state.get_db_connection().map_err(|e| e.to_string())?;
        let mut stmt = conn.prepare("SELECT * FROM users WHERE id = ?1").map_err(|e| e.to_string())?;

        let user = stmt.query_row([id], |row| {
            Ok(User {
                id: row.get(0)?,
                username: row.get(1)?,
                password: row.get(2)?,
                role: row.get(3)?
            })
        }).map_err(|e| e.to_string())?;
        Ok(user)
    }

    pub async fn update(user: User, state: &State<AppState>) -> Result<String, String> {
        let conn = state.get_db_connection().map_err(|e| e.to_string())?;

        let rows_affected = conn.execute(
            "UPDATE users SET username = ?1, role = ?2 WHERE id = ?3",
            params![user.username, user.role, user.id],
        ).map_err(|e| e.to_string())?;
        Ok(format!("Success: {} row(s) updated", rows_affected))
    }

    pub async fn update_passwd(user: User, state: &State<AppState>) -> Result<String, String> {
        let hash = hash(user.password.as_bytes()).await;
        let conn = state.get_db_connection().map_err(|e| e.to_string())?;

        let rows_affected = conn.execute(
            "UPDATE users SET password = ?1 WHERE id = ?2",
            params![hash, user.id],
        ).map_err(|e| e.to_string())?;
        Ok(format!("Success: {} row(s) updated", rows_affected))
    }

    pub async fn delete_by_id(id: u64, state: &State<AppState>) -> Result<String, String> {
        let conn = state.get_db_connection().map_err(|e| e.to_string())?;
        let rows_affected = conn.execute(
            "DELETE FROM users WHERE id = ?1", 
            params![id]
        ).map_err(|e| e.to_string())?;
        if rows_affected == 0 {
            return Err("No rows deleted, user not found.".to_string());
        } 
        Ok(format!("Success: {} row(s) deleted", rows_affected))
    }
}