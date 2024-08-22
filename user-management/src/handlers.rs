use actix_web::{web, HttpResponse, Responder};
use crate::models::User;
use crate::db::AppState;


pub async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

pub async fn create_user(user_json: web::Json<User>, app_state: web::Data<AppState>) -> impl Responder {    
    match User::create(user_json.into_inner(), app_state).await {
        Ok(new_user) => HttpResponse::Ok().json(new_user),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

pub async fn get_user(id: web::Json<String>, app_state: web::Data<AppState>) -> impl Responder {
    match User::find_by_id(id.0, app_state).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(e) => HttpResponse::InternalServerError().body(e),
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
