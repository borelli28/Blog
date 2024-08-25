use actix_web::{web, App, HttpServer};
use actix_session::{SessionMiddleware};
use actix_session::storage::CookieSessionStore;
use actix_web::cookie::Key;
use crate::token::{get_csrf_token, verify_csrf_token};

pub mod token;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let session_key = Key::generate();

    HttpServer::new(move || {
        App::new()
            .wrap(SessionMiddleware::new(
                CookieSessionStore::default(),
                session_key.clone(),
            ))
            .service(
                web::scope("/csrf")
                    .route("/token", web::get().to(get_csrf_token))
                    .route("/verify", web::post().to(verify_csrf_token))
            )
    })
    .bind("127.0.0.1:8081")?
    .run()
    .await
}
