use crate::models::{User, LoginCredentials, LoginResponse};
use crate::auth_middleware::AuthenticatedUser;
use rocket::http::{Cookie, CookieJar, Status};
use crate::jwt_deny_list::JwtDenyList;
use rocket::{get, put, post, delete};
use rocket::serde::json::Json;
use crate::auth::create_token;
use crate::db::AppState;
use rocket::State;



#[post("/", data = "<user_data>")]
pub async fn create_user(user_data: Json<LoginCredentials>, state: &State<AppState>) -> Result<Json<User>, String> {
    let user = User::create(user_data.into_inner(), state).await?;
    Ok(Json(user))
}

#[post("/login", data = "<user_data>")]
pub async fn login(user_data: Json<LoginCredentials>, cookies: &CookieJar<'_>, state: &State<AppState>) -> Result<Json<LoginResponse>, Status> {
    match User::login(user_data.into_inner(), state).await {
        Ok(user) => {
            let token = create_token(&user.id, &user.role).map_err(|_| Status::InternalServerError)?;
            cookies.add_private(
                Cookie::build(("jwt", token.clone()))
                    .http_only(true)
                    .secure(false)   // Change to true on SSL
                    .same_site(rocket::http::SameSite::Lax),
            );
            Ok(Json(LoginResponse { user, token }))
        }
        Err(_) => Err(Status::Unauthorized),
    }
}

#[post("/logout")]
pub async fn logout(cookies: &CookieJar<'_>, deny_list: &State<JwtDenyList>) -> Status {
    if let Some(jwt_cookie) = cookies.get_private("jwt") {
        let token = jwt_cookie.value();
        if let Err(e) = deny_list.add(token) {
            eprintln!("Failed to add token to deny list: {}", e);
        }
        cookies.remove_private(Cookie::build("jwt"));
        Status::Ok
    } else {
        Status::NoContent
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