use actix_web::web;
use rusqlite::{Connection, Result as SqliteResult};
use std::sync::Mutex;


pub struct AppState {
    pub db: Mutex<Connection>,
}

impl AppState {
    pub async fn new() -> SqliteResult<Self> {
        let conn = init_db().await?;
        Ok(AppState {
            db: Mutex::new(conn),
        })
    }
}

async fn init_db() -> SqliteResult<Connection> {
    let conn = Connection::open("users.db")?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )",
        [],
    )?;

    Ok(conn)
}

pub fn get_db_connection(data: &web::Data<AppState>) -> SqliteResult<std::sync::MutexGuard<'_, Connection>> {
    data.db.lock().map_err(|e| rusqlite::Error::SqliteFailure(
        rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_ERROR),
        Some(format!("Failed to acquire database lock: {}", e)),
    ))
}
