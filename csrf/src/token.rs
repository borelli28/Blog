use actix_web::{web, HttpResponse};
use actix_session::Session;
use rand::Rng;
use rand::distributions::Alphanumeric;
use actix_web::cookie::{Cookie, SameSite};

const CSRF_TOKEN_KEY: &str = "csrf_token";

pub fn generate_csrf_token() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

pub async fn get_csrf_token(session: Session) -> HttpResponse {
    let csrf_token = generate_csrf_token();
    session.insert(CSRF_TOKEN_KEY, csrf_token.clone()).unwrap();
    HttpResponse::Ok()
        .cookie(Cookie::build("csrf_token", csrf_token.clone())
            .path("/")
            .http_only(false)
            .secure(true)
            .same_site(SameSite::Strict)
            .finish())
        .json(csrf_token)
}

pub async fn verify_csrf_token(session: Session, body: web::Json<String>) -> HttpResponse {
    let token = body.into_inner();
    
    let is_valid = match session.get::<String>(CSRF_TOKEN_KEY) {
        Ok(Some(stored_token)) => stored_token == token,
        _ => false,
    };
    
    if is_valid {
        HttpResponse::Ok().finish()
    } else {
        HttpResponse::Forbidden().finish()
    }
}
