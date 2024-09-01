use rusqlite::{Connection, Result};
use std::sync::Mutex;


pub struct AppState {
    pub db: Mutex<Connection>,
}

impl AppState {
    pub fn new() -> Result<Self> {
        let conn = Connection::open("users.db")?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )",
            [],
        )?;
        Ok(AppState {
            db: Mutex::new(conn),
        })
    }

    pub fn get_db_connection(&self) -> Result<std::sync::MutexGuard<'_, Connection>> {
        // Attempt to acquire lock
        // If the lock is successfully acquired, return the MutexGuard
        // If it fails, convert the error to a rusqlite error
        self.db.lock()
            .map_err(|_| rusqlite::Error::InvalidParameterName("Failed to lock database".to_string()))
    }
}