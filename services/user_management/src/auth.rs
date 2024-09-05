use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey, errors::Error as JwtError};
use crate::jwt_deny_list::JwtDenyList;
use serde::{Serialize, Deserialize};
use chrono::{Utc, Duration};
use std::env;


#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: u64,  // User ID
    pub exp: i64,     // Expiration time
    pub role: String, // User role
}

pub fn create_token(user_id: &u64, role: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp();

    let claims = Claims {
        sub: user_id.to_owned(),
        exp: expiration,
        role: role.to_owned(),
    };
    let secret_key: String = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY env variable needs to be set");
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret_key.as_ref()))
}

pub fn validate_token(token: &str, deny_list: &JwtDenyList) -> Result<Claims, JwtError> {
    let secret_key = env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY env variable needs to be set");
    // Check if the token is in the deny list
    match deny_list.is_denied(token) {
        Ok(true) => return Err(JwtError::from(jsonwebtoken::errors::ErrorKind::InvalidToken)),
        Ok(false) => {},
        Err(_) => return Err(JwtError::from(jsonwebtoken::errors::ErrorKind::InvalidToken)),
    }    
    // Decode and validate
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret_key.as_ref()),
        &Validation::default(),
    )?;
    Ok(token_data.claims)
}