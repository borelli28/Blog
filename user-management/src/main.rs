use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use crate::models::User;
use crate::db::AppState;
pub mod models;
pub mod db;


async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

async fn create_user(user_json: web::Json<User>, app_state: web::Data<AppState>) -> impl Responder {    
    match User::create(user_json.into_inner(), app_state).await {
        Ok(new_user) => HttpResponse::Ok().json(new_user),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

async fn get_user(id: web::Json<String>, app_state: web::Data<AppState>) -> impl Responder {
    match User::find_by_id(id.0, app_state).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

async fn update_user(user_json: web::Json<User>, app_state: web::Data<AppState>) -> impl Responder {
    match User::update(user_json.into_inner(), app_state).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

async fn update_passwd(user_json: web::Json<User>, app_state: web::Data<AppState>) -> impl Responder {
    match User::update(user_json.into_inner(), app_state).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

async fn delete_user(id: web::Json<String>, app_state: web::Data<AppState>) -> impl Responder {
    match User::delete_by_id(id.0, app_state).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => HttpResponse::InternalServerError().body(e),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let app_state = web::Data::new(
        AppState::new().await.expect("Failed to initialize AppState")
    );

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone()) // Share with all routes
            .service(
                web::scope("/User")
                    .route("/", web::get().to(index))
                    .route("/create", web::post().to(create_user))
                    .route("/get", web::get().to(get_user))
                    .route("/update", web::put().to(update_user))
                    .route("/update_passwd", web::put().to(update_passwd))
                    .route("/delete", web::delete().to(delete_user))
            )
    })
    .bind(("127.0.0.1", 1234))?
    .run()
    .await
}
