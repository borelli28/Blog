use actix_web::{web, App, HttpServer};
use crate::db::AppState;
pub mod handlers;
pub mod models;
pub mod db;


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
