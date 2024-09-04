use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use crate::auth::{validate_token, Claims};


pub struct AuthenticatedUser {
    pub claims: Claims,
}

#[derive(Debug)]
pub enum AuthError {
    Missing,
    Invalid,
    Expired
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthenticatedUser {
    type Error = AuthError;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let token = request.headers().get_one("Authorization");
        match token {
            Some(token) if token.starts_with("Bearer ") => {
                let token = token.split_at(7).1; // Remove "Bearer " prefix
                match validate_token(token) {
                    Ok(claims) => Outcome::Success(AuthenticatedUser { claims }),
                    Err(err) => {
                        if err.to_string().contains("ExpiredSignature") {
                            Outcome::Error((Status::Unauthorized, AuthError::Expired))
                        } else {
                            Outcome::Error((Status::Unauthorized, AuthError::Invalid))
                        }
                    }
                }
            }
            _ => {
                Outcome::Error((Status::Unauthorized, AuthError::Missing))
            }
        }
    }
}