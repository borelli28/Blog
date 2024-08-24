use actix_csrf::{CsrfMiddleware, CsrfMiddlewareConfig, extractor::{CsrfToken, CsrfGuarded}};
use actix_web::{dev::ServiceResponse,error::Error,http::header,web, HttpMessage, HttpResponse};
use actix_web::cookie::{Cookie, SameSite};
use std::time::Duration;
use serde::Deserialize;


pub fn configure_csrf() -> CsrfMiddleware {
    let config = CsrfMiddlewareConfig::new()
        .set_cookie_name("csrf_token")
        .set_cookie_path("/")
        .set_cookie_domain(127.0.0.1)
        .set_cookie_secure(true)
        .set_cookie_http_only(true)
        .set_cookie_same_site(SameSite::Strict)
        .set_token_lifetime(Some(Duration::from_secs(15 * 60))); // 15 minutes

    CsrfMiddleware::new(config)
}

pub fn add_csrf_token_to_headers(mut res: ServiceResponse<actix_web::body::BoxBody>) -> Result<ServiceResponse<actix_web::body::BoxBody>, Error> {
    if let Some(csrf_token) = res.request().extensions().get::<CsrfToken>() {
        res.headers_mut().insert(
            header::HeaderName::from_static("x-csrf-token"),
            header::HeaderValue::from_str(csrf_token.token()).unwrap(),
        );
    }
    Ok(res)
}