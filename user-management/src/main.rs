use actix_web::{web, http, App, HttpServer};
use crate::db::AppState;
use actix_cors::Cors;
pub mod handlers;
pub mod models;
pub mod auth;
pub mod db;

use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let app_state = web::Data::new(
        AppState::new().await.expect("Failed to initialize AppState")
    );

    // Load TLS keys
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder.set_private_key_file("key.pem", SslFiletype::PEM).unwrap();
    builder.set_certificate_chain_file("cert.pem").unwrap();

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("https://localhost:4443")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .supports_credentials()
            .expose_headers(&[http::header::SET_COOKIE])
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
    .bind_openssl("127.0.0.1:8443", builder)?
    .bind(("127.0.0.1", 1234))?
    .run()
    .await
}
