use actix_web::{web, http, App, HttpServer};
use crate::db::AppState;
use actix_cors::Cors;
pub mod handlers;
pub mod models;
pub mod auth;
pub mod db;


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let app_state = web::Data::new(
        AppState::new().await.expect("Failed to initialize AppState")
    );

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:8000")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(app_state.clone()) // Share with all routes
            .service(
                web::scope("/User")
                    .route("/", web::get().to(handlers::index))
                    .route("/create", web::post().to(handlers::create_user))
                    .route("/get", web::get().to(handlers::get_user))
                    .route("/update", web::put().to(handlers::update_user))
                    .route("/update_passwd", web::put().to(handlers::update_passwd))
                    .route("/delete", web::delete().to(handlers::delete_user))
            )
    })
    .bind(("127.0.0.1", 1234))?
    .run()
    .await
}
