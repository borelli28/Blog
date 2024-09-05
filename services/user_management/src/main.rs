use crate::jwt_deny_list::JwtDenyList;
use rocket::{Build, Rocket, routes};
use rocket::fairing::AdHoc;
use db::AppState;
mod auth_middleware;
mod jwt_deny_list;
mod handlers;
mod models;
mod auth;
mod db;


#[rocket::launch]
fn rocket() -> Rocket<Build> {
    let jwt_deny_list = JwtDenyList::new("denied_tokens.db");
    rocket::build()
        .manage(jwt_deny_list)
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