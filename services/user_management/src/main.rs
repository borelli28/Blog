use rocket::{Build, Rocket, routes};
use rocket::fairing::AdHoc;
use db::AppState;
mod auth_middleware;
mod handlers;
mod models;
mod auth;
mod db;


#[rocket::launch]
fn rocket() -> Rocket<Build> {
    rocket::build()
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