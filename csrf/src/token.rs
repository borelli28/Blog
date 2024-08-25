use actix_session::Session;
use rand::Rng;
use rand::distributions::Alphanumeric;
use actix_web::cookie::{Cookie, SameSite};
use actix_web::{HttpRequest};

const CSRF_TOKEN_KEY: &str = "csrf_token";

pub fn generate_csrf_token() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

pub fn verify_csrf_token(session: &Session, token: &str) -> bool {
    match session.get::<String>(CSRF_TOKEN_KEY) {
        Ok(Some(stored_token)) => stored_token == token,
        _ => false,
    }
}

pub fn set_csrf_token(session: &Session) -> Option<String> {
    let csrf_token = generate_csrf_token();
    match session.insert(CSRF_TOKEN_KEY, csrf_token.clone()) {
        Ok(_) => Some(csrf_token),
        Err(_) => None,
    }
}

fn extract_csrf_token(req: &HttpRequest) -> Option<String> {
    req.headers()
        .get("x-csrf-token")
        .and_then(|header_value| header_value.to_str().ok().map(|s| s.to_string()))
}


pub fn set_csrf_cookie(csrf_token: &str) -> Cookie<'static> {
    Cookie::build("csrf_token", csrf_token.to_owned())
        .path("/")
        .http_only(false)
        .secure(true)
        .same_site(SameSite::Strict)
        .finish()
}
