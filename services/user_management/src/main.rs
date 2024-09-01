use rocket::{Build, Rocket, routes};
use rocket::fairing::AdHoc;
use rocket::fs::FileServer;
use db::AppState;
mod handlers;
mod models;
mod db;


#[rocket::launch]
fn rocket() -> Rocket<Build> {
    rocket::build()
        .mount("/user-management", routes![
            handlers::get_user,
            handlers::create_user,
            handlers::update_user,
            handlers::update_password,
            handlers::delete_user,
        ])
        .mount("/", FileServer::from("static"))
        .attach(AdHoc::on_ignite("Database", |rocket| async {
            let app_state = AppState::new().expect("Failed to initialize app state");
            rocket.manage(app_state)
        }))
}