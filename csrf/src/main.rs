use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use actix_web::{web, App, HttpServer};
use actix_session::{SessionMiddleware};
use actix_session::storage::CookieSessionStore;
use actix_web::cookie::Key;
use crate::token::{send_csrf_token, verify_csrf_token};

pub mod token;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let session_key = Key::generate();

    // Load TLS keys
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder.set_private_key_file("key.pem", SslFiletype::PEM).unwrap();
    builder.set_certificate_chain_file("cert.pem").unwrap();

    HttpServer::new(move || {
        App::new()
            .wrap(SessionMiddleware::new(
                CookieSessionStore::default(),
                session_key.clone(),
            ))
            .service(
                web::scope("/csrf")
                    .route("/get_token", web::get().to(send_csrf_token))
                    .route("/verify", web::post().to(verify_csrf_token))
            )
    })
    .bind_openssl("127.0.0.1:8444", builder)?
    .bind("127.0.0.1:8081")?
    .run()
    .await
}
