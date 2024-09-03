use crate::auth_middleware::AuthenticatedUser;
use crate::models::{User, LoginCredentials};
use rocket::{get, put, post, delete};
use rocket::serde::json::Json;
use rocket::http::Status;
use crate::db::AppState;
use rocket::State;


#[post("/", data = "<user_data>")]
pub async fn create_user(user_data: Json<LoginCredentials>, state: &State<AppState>) -> Result<Json<User>, String> {
    let user = User::create(user_data.into_inner(), state).await?;
    Ok(Json(user))
}

#[get("/<id>")]
pub async fn get_user(id: u64, state: &State<AppState>, auth_user: AuthenticatedUser) -> Result<Json<User>, Status> {
    if auth_user.claims.sub != id {
        return Err(Status::Forbidden);
    }
    let user = User::find_by_id(id, state).await
        .map_err(|_| Status::NotFound)?;
    Ok(Json(user))
}

#[put("/<id>", data = "<user>")]
pub async fn update_user(id: u64, user: Json<User>, state: &State<AppState>, auth_user: AuthenticatedUser) -> Result<String, Status> {
    if auth_user.claims.sub != id {
        return Err(Status::Forbidden);
    }
    let mut updated_user = user.into_inner();
    updated_user.id = id;
    User::update(updated_user, state).await.map_err(|_| Status::InternalServerError)?;
    Ok(String::from("User updated"))
}

#[put("/<id>/password", data = "<user>")]
pub async fn update_password(id: u64, user: Json<User>, state: &State<AppState>, auth_user: AuthenticatedUser) -> Result<String, Status> {
    if auth_user.claims.sub != id {
        return Err(Status::Forbidden);
    }
    let mut updated_user = user.into_inner();
    updated_user.id = id;
    User::update_passwd(updated_user, state).await.map_err(|_| Status::InternalServerError)?;
    Ok(String::from("User updated"))
}

#[delete("/<id>")]
pub async fn delete_user(id: u64, state: &State<AppState>, auth_user: AuthenticatedUser) -> Result<String, Status> {
    if auth_user.claims.sub != id {
        return Err(Status::Forbidden);
    }
    User::delete_by_id(id, state).await.map_err(|_| Status::InternalServerError)?;
    Ok(String::from("User deleted"))
}