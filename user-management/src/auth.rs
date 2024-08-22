use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use time::{Duration as TimeDuration, OffsetDateTime};
use actix_web::cookie::{Cookie, SameSite};
use serde::{Serialize, Deserialize};
use crate::models::User;
use dotenvy::dotenv;
use std::env;


#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: i64,
    role: String,
}

fn get_jwt_secret() -> String {
    dotenv().ok();
    env::var("JWT_SECRET").expect("JWT_SECRET must be set in .env file")
}

const TOKEN_DURATION: i64 = 60 * 60; // 1 hour in seconds

pub fn create_jwt(user: &User) -> Result<String, jsonwebtoken::errors::Error> {
    let jwt_secret = get_jwt_secret();
    let expiration = OffsetDateTime::now_utc() + TimeDuration::seconds(TOKEN_DURATION);
    let claims = Claims {
        sub: user.id.clone(),
        exp: expiration.unix_timestamp(),
        role: user.role.clone(),
    };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.as_bytes()))
}

fn validate_jwt(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let jwt_secret = get_jwt_secret();
    let validation = Validation::new(Algorithm::HS256);
    let token_data = decode::<Claims>(token, &DecodingKey::from_secret(jwt_secret.as_bytes()), &validation)?;
    Ok(token_data.claims)
}

pub fn create_auth_cookie(jwt: &str) -> Cookie<'static> {
    Cookie::build("auth_token", jwt.to_owned())
        .secure(true)
        .http_only(true)
        .same_site(SameSite::None)
        .max_age(TimeDuration::seconds(TOKEN_DURATION))
        .finish()
}
