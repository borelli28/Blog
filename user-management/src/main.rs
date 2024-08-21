use actix_web::{web, App, HttpResponse, HttpServer, Responder};
pub mod models;
pub mod db;


async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(
            web::scope("/User")
                .route("/", web::get().to(index))
        )
    })
    .bind(("127.0.0.1", 1234))?
    .run()
    .await
}
