use rocket::request::{FromRequest, Outcome, Request};
use crate::auth::{validate_token, Claims};
use rocket::http::Status;


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
        if let Some(cookie) = request.cookies().get_private("jwt") {
            let token = cookie.value();
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
        } else {
            Outcome::Error((Status::Unauthorized, AuthError::Missing))
        }
    }
}