use crate::jwt_deny_list::{JwtDenyList, JwtDenyListFairing};
use rocket_cors::{AllowedOrigins, CorsOptions};
use rocket::fairing::AdHoc;
use rocket::http::Method;
use rocket::routes;
use db::AppState;
mod auth_middleware;
mod jwt_deny_list;
mod handlers;
mod models;
mod auth;
mod db;


#[rocket::launch]
fn rocket() -> _ {
    let cors = CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .allowed_methods(
            vec![Method::Get, Method::Post, Method::Put, Method::Delete]
                .into_iter()
                .map(From::from)
                .collect(),
        )
        .allow_credentials(true)
        .to_cors()
        .expect("CORS configuration error");

    let jwt_deny_list = JwtDenyList::new("denied_tokens.db").expect("Failed to create JwtDenyList");

    rocket::build()
        .manage(jwt_deny_list)
        .attach(JwtDenyListFairing)
        .attach(cors.clone())
        .mount("/user-management", routes![
            handlers::create_user,
            handlers::login,
            handlers::logout,
            handlers::get_user,
            handlers::update_user,
            handlers::update_password,
            handlers::delete_user,
        ])
        .attach(AdHoc::on_ignite("Database", |rocket| async {
            let app_state = AppState::new().expect("Failed to initialize app state");
            rocket.manage(app_state)
        }))
}