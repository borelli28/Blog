use rusqlite::{Connection, Result as SqliteResult, params};
use jsonwebtoken::{decode, Validation, DecodingKey};
use rocket::fairing::{Fairing, Info, Kind};
use chrono::{Utc, DateTime};
use std::sync::{Arc, Mutex};
use rocket::{Rocket, Orbit};
use crate::auth::Claims;
use std::time::Duration;
use rocket::tokio;
use std::env;


pub struct JwtDenyList {
    conn: Arc<Mutex<Connection>>,
}

impl JwtDenyList {
    pub fn new(db_path: &str) -> SqliteResult<Self> {
        let conn = Connection::open(db_path)?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS denied_tokens (
                token TEXT PRIMARY KEY,
                expires_at DATETIME NOT NULL
            )",
            [],
        )?;
        Ok(JwtDenyList {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    pub fn add(&self, token: &str) -> SqliteResult<()> {
        let secret_key = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");
        // Decode the token to get the expiration time
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret_key.as_ref()),
            &Validation::default()
        ).map_err(|e| rusqlite::Error::InvalidParameterName(e.to_string()))?;

        // Convert expiration time to RFC3339 string
        let expires_at = DateTime::<Utc>::from_timestamp(token_data.claims.exp as i64, 0)
            .ok_or_else(|| rusqlite::Error::InvalidParameterName("Invalid expiration timestamp".to_string()))?
            .to_rfc3339();

        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO denied_tokens (token, expires_at) VALUES (?, ?)",
            params![token, expires_at],
        )?;
        Ok(())
    }

    pub fn is_denied(&self, token: &str) -> SqliteResult<bool> {
        let conn = self.conn.lock().unwrap();
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM denied_tokens WHERE token = ? AND expires_at > datetime('now')",
            params![token],
            |row| row.get(0),
        )?;
        Ok(count > 0)
    }

    fn remove_expired_tokens(conn: &Arc<Mutex<Connection>>) -> SqliteResult<()> {
        let conn = conn.lock().unwrap();
        conn.execute(
            "DELETE FROM denied_tokens WHERE expires_at <= datetime('now')",
            [],
        )?;
        Ok(())
    }
}

pub struct JwtDenyListFairing;

#[rocket::async_trait]
impl Fairing for JwtDenyListFairing {
    fn info(&self) -> Info {
        Info {
            name: "JWT Deny List Cleanup",
            kind: Kind::Liftoff,
        }
    }

    async fn on_liftoff(&self, rocket: &Rocket<Orbit>) {
        let deny_list = rocket.state::<JwtDenyList>().expect("JwtDenyList not managed");
        let conn = Arc::clone(&deny_list.conn);
        // Scheduled task that runs every 12 hours
        // Removes expired tokens from deny list
        rocket::tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(12 * 60 * 60));
            loop {
                interval.tick().await;
                if let Err(e) = JwtDenyList::remove_expired_tokens(&conn) {
                    eprintln!("Error during cleanup: {}", e);
                }
            }
        });
    }
}