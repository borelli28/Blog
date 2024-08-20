use serde::{Deserialize, Serialize};
use crate::db::{self, AppState};
use actix_web::web;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: String,
    pub password: String,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginCredentials {
    pub username: String,
    pub password: String,
}

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};

pub async fn hash(password: &[u8]) -> String {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password, &salt)
        .expect("Unable to hash password.")
        .to_string()
}

impl User {
    pub async fn create(mut user: User, data: web::Data<AppState>) -> Result<User, String> {
        let conn = db::get_db_connection(&data).map_err(|e| e.to_string())?;

        let hash = hash(user.password.as_bytes()).await;
        user.password = hash;
        user.id = Uuid::new_v4().to_string();

        let username_exists: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM users WHERE username = ?1)",
            &[&user.username],
            |row| row.get(0),
        ).map_err(|e| e.to_string())?;

        if username_exists {
            return Err(String::from("Username already exists"));
        }

        // Insert new user
        conn.execute(
            "INSERT INTO users (id, username, password, role) VALUES (?1, ?2, ?3, ?4)",
            &[&user.id, &user.username, &user.password, &user.role],
        ).map_err(|e| e.to_string())?;

        Ok(user)
    }
}
