use rocket::request::{FromRequest, Outcome, Request};
use crate::auth::{validate_token, Claims};
use rocket::http::Status;
use crate::JwtDenyList;


pub struct AuthenticatedUser {
    pub claims: Claims,
}

#[derive(Debug)]
pub enum AuthError {
    Missing,
    Invalid,
    Expired,
    Denied,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthenticatedUser {
    type Error = AuthError;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        // Get JwtDenyList from managed state
        let deny_list = request.rocket().state::<JwtDenyList>()
            .expect("JwtDenyList not found in Rocket managed state");

        if let Some(cookie) = request.cookies().get_private("jwt") {
            let token = cookie.value();
            // Check if the token is in the deny list
            match deny_list.is_denied(token) {
                Ok(true) => return Outcome::Error((Status::Unauthorized, AuthError::Denied)),
                Err(_) => return Outcome::Error((Status::Unauthorized, AuthError::Invalid)),
                Ok(false) => {} // Token is not denied, continue with validation
            }
            match validate_token(token, deny_list) {
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