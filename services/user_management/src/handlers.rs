use crate::models::{User, LoginCredentials};
use rocket::{get, put, post, delete};
use rocket::serde::json::Json;
use crate::db::AppState;
use rocket::State;


#[post("/", data = "<user_data>")]
pub async fn create_user(user_data: Json<LoginCredentials>, state: &State<AppState>) -> Result<Json<User>, String> {
    let user = User::create(user_data.into_inner(), state).await?;
    Ok(Json(user))
}

#[get("/<id>")]
pub async fn get_user(id: u64, state: &State<AppState>) -> Result<Json<User>, String> {
    let user = User::find_by_id(id, state).await?;
    Ok(Json(user))
}

#[put("/<id>", data = "<user>")]
pub async fn update_user(id: u64, user: Json<User>, state: &State<AppState>) -> Result<String, String> {
    let mut updated_user = user.into_inner();
    updated_user.id = id;
    User::update(updated_user, state).await
}

#[put("/<id>/password", data = "<user>")]
pub async fn update_password(id: u64, user: Json<User>, state: &State<AppState>) -> Result<String, String> {
    let mut updated_user = user.into_inner();
    updated_user.id = id;
    User::update_passwd(updated_user, state).await
}

#[delete("/<id>")]
pub async fn delete_user(id: u64, state: &State<AppState>) -> Result<String, String> {
    User::delete_by_id(id, state).await
}