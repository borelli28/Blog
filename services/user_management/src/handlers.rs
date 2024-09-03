use crate::auth_middleware::AuthenticatedUser;
use crate::models::{User, LoginCredentials, LoginResponse};
use rocket::{get, put, post, delete};
use rocket::serde::json::Json;
use crate::auth::create_token;
use rocket::http::Status;
use crate::db::AppState;
use rocket::State;


#[post("/", data = "<user_data>")]
pub async fn create_user(user_data: Json<LoginCredentials>, state: &State<AppState>) -> Result<Json<User>, String> {
    let user = User::create(user_data.into_inner(), state).await?;
    Ok(Json(user))
}

#[post("/login", data = "<user_data>")]
pub async fn login(user_data: Json<LoginCredentials>, state: &State<AppState>) -> Result<Json<LoginResponse>, Status> {
    match User::login(user_data.into_inner(), state).await {
        Ok(user) => {
            match create_token(&user.id, &user.role) {
                Ok(token) => {
                    let response = LoginResponse {
                        user,
                        token,
                    };
                    Ok(Json(response))
                },
                Err(_) => Err(Status::InternalServerError),
            }
        }
        Err(_) => Err(Status::Unauthorized),
    }
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
pub async fn update_user(id: u64, user: Json<User>, state: &State<AppState>, auth_user: AuthenticatedUser) -> Status {
    if auth_user.claims.sub != id {
        return Status::Forbidden;
    }
    let mut updated_user = user.into_inner();
    updated_user.id = id;
    match User::update(updated_user, state).await {
        Ok(_) => Status::Ok,
        Err(_) => Status::InternalServerError,
    }
}

#[put("/<id>/password", data = "<user>")]
pub async fn update_password(id: u64, user: Json<User>, state: &State<AppState>, auth_user: AuthenticatedUser) -> Status {
    if auth_user.claims.sub != id {
        return Status::Forbidden;
    }
    let mut updated_user = user.into_inner();
    updated_user.id = id;
    match User::update_passwd(updated_user, state).await {
        Ok(_) => return Status::Ok,
        Err(_) => Status::InternalServerError,
    }
}

#[delete("/<id>")]
pub async fn delete_user(id: u64, state: &State<AppState>, auth_user: AuthenticatedUser) -> Status {
    if auth_user.claims.sub != id {
        return Status::Forbidden;
    }
    match User::delete_by_id(id, state).await {
        Ok(_) => return Status::Ok,
        Err(_) => return Status::Forbidden,
    }
}