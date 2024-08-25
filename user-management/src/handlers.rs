use actix_web::http::header;
use actix_web::{web, Responder, HttpRequest, HttpResponse};
use crate::models::{User, LoginCredentials};
use crate::auth::{validate_jwt, Claims, create_jwt, create_auth_cookie};
use crate::db::AppState;
use reqwest::Client;


async fn verify_csrf_token_api(csrf_token: &str) -> Result<bool, reqwest::Error> {
    let client = Client::new();
    let response = client
        .post("https://127.0.0.1:8444/csrf/verify")
        .json(&csrf_token)
        .send()
        .await?;
    Ok(response.status().is_success())
}

async fn extract_and_verify_csrf_token(req: &HttpRequest) -> Result<(), HttpResponse> {
    let csrf_token = req.cookie("csrf_token")
        .map(|c| c.value().to_string())
        .ok_or_else(|| HttpResponse::Unauthorized().json("CSRF token missing"))?;

    match verify_csrf_token_api(&csrf_token).await {
        Ok(true) => Ok(()),
        Ok(false) => Err(HttpResponse::Forbidden().json("Invalid CSRF token")),
        Err(e) => Err(HttpResponse::InternalServerError().json(e.to_string())),
    }
}

async fn extract_and_validate_token(req: &HttpRequest) -> Result<Claims, HttpResponse> {
    let token = req
        .cookie("auth_token")
        .map(|c| c.value().to_string())
        .or_else(|| {
            req.headers()
                .get("Authorization")
                .and_then(|h| h.to_str().ok())
                .and_then(|auth| auth.strip_prefix("Bearer ").map(|t| t.to_string()))
        });

    match token {
        Some(token) => match validate_jwt(&token) {
            Ok(claims) => Ok(claims),
            Err(_) => Err(HttpResponse::Unauthorized().json("Invalid token"))
        },
        None => Err(HttpResponse::Unauthorized().json("No token provided"))
    }
}

pub async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

pub async fn create_user(user_json: web::Json<LoginCredentials>, req: HttpRequest, app_state: web::Data<AppState>)
-> HttpResponse {
    if let Err(response) = extract_and_verify_csrf_token(&req).await {
        return response;
    }

    match User::create(user_json.into_inner(), app_state).await {
        Ok(new_user) => {
            match create_jwt(&new_user) {
                Ok(token) => {
                    let cookie = create_auth_cookie(&token);
                    let cookie_value = format!("{}; Partitioned", cookie.to_string());
                    HttpResponse::Ok()
                        .append_header((header::SET_COOKIE, cookie_value))
                        .append_header((header::AUTHORIZATION, format!("Bearer {}", token)))
                        .json(new_user)
                },
                Err(_) => HttpResponse::InternalServerError().body("Failed to create JWT"),
            }
        },
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn get_user(id: web::Json<String>, request: HttpRequest, app_state: web::Data<AppState>) -> impl Responder {
    match extract_and_validate_token(&request).await {
        Ok(claims) => {
            if claims.sub == id.0 {
                match User::find_by_id(id.0, app_state).await {
                    Ok(user) => HttpResponse::Ok().json(user),
                    Err(e) => HttpResponse::InternalServerError().body(e),
                }
            } else {
                HttpResponse::Forbidden().json("Access denied")
            }
        },
        Err(response) => response,
    }
}

pub async fn update_user(user_json: web::Json<User>, app_state: web::Data<AppState>) -> impl Responder {
    match User::update(user_json.into_inner(), app_state).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn update_passwd(user_json: web::Json<User>, app_state: web::Data<AppState>) -> impl Responder {
    match User::update(user_json.into_inner(), app_state).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn delete_user(id: web::Json<String>, app_state: web::Data<AppState>) -> impl Responder {
    match User::delete_by_id(id.0, app_state).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}
