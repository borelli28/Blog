use rand::Rng;
use actix_session::Session;
use actix_web::{HttpResponse, Error};

const CSRF_TOKEN_KEY: &str = "csrf_token";

pub fn generate_csrf_token() -> String {
    rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

pub async fn set_csrf_token(session: Session) -> Result<HttpResponse, Error> {
    let csrf_token = generate_csrf_token();
    session.insert(CSRF_TOKEN_KEY, csrf_token.clone())?;
    Ok(HttpResponse::Ok().json(csrf_token))
}

pub fn verify_csrf_token(session: &Session, token: &str) -> bool {
    if let Some(stored_token) = session.get::<String>(CSRF_TOKEN_KEY).unwrap_or(None) {
        stored_token == token
    } else {
        false
    }
}
