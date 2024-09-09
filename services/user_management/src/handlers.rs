use crate::models::{User, LoginCredentials, LoginResponse};
use crate::auth_middleware::AuthenticatedUser;
use rocket::http::{Cookie, CookieJar, Status};
use crate::jwt_deny_list::JwtDenyList;
use rocket::{get, put, post, delete};
use rocket::response::status::Custom;
use rocket::serde::json::Json;
use crate::auth::create_token;
use crate::db::AppState;
use rocket::State;


fn sanitize_input(input: &str) -> String {
    input.trim().replace(['<', '>', '&', '"', '\''], "")
}

#[post("/", data = "<user_data>")]
pub async fn create_user(user_data: Json<LoginCredentials>, state: &State<AppState>) -> Result<Json<User>, Status> {
    let mut sanitized_data = user_data.into_inner();
    sanitized_data.username = sanitize_input(&sanitized_data.username);
    sanitized_data.password = sanitize_input(&sanitized_data.password);
    let user = User::create(sanitized_data, state).await.map_err(|_| Status::InternalServerError)?;
    Ok(Json(user))
}

#[post("/login", data = "<user_data>")]
pub async fn login(user_data: Json<LoginCredentials>, cookies: &CookieJar<'_>, state: &State<AppState>) -> Result<Json<LoginResponse>, Custom<String>> {
    let mut sanitized_data = user_data.into_inner();
    sanitized_data.username = sanitize_input(&sanitized_data.username);
    sanitized_data.password = sanitize_input(&sanitized_data.password);
    match User::login(sanitized_data, state).await {
        Ok(user) => {
            let token = create_token(&user.id, &user.role).map_err(|_| Custom(Status::InternalServerError, "Failed to create token".to_string()))?;
            cookies.add_private(
                Cookie::build(("jwt", token.clone()))
                    .http_only(true)
                    .secure(false)   // Change to true on SSL
                    .same_site(rocket::http::SameSite::Lax),
            );
            Ok(Json(LoginResponse { user, token }))
        }
        Err(_) => Err(Custom(Status::InternalServerError, "Login failed".to_string())),
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
    updated_user.username = sanitize_input(&updated_user.username);
    updated_user.role = sanitize_input(&updated_user.role);
    match User::update(updated_user, state).await {
        Ok(_) => Status::Ok,
        Err(_) => Status::InternalServerError,
    }
}

#[put("/<id>/password", data = "<user_data>")]
pub async fn update_password(id: u64, user_data: Json<LoginCredentials>, state: &State<AppState>, auth_user: AuthenticatedUser) -> Status {
    if auth_user.claims.sub != id {
        return Status::Forbidden;
    }
    let mut updated_user = user_data.into_inner();
    updated_user.username = sanitize_input(&updated_user.username);
    updated_user.password = sanitize_input(&updated_user.password);
    match User::update_passwd(updated_user, state).await {
        Ok(_) => Status::Ok,
        Err(_) => Status::InternalServerError,
    }
}

#[delete("/<id>")]
pub async fn delete_user(id: u64, state: &State<AppState>, auth_user: AuthenticatedUser) -> Status {
    if auth_user.claims.sub != id {
        return Status::Forbidden;
    }
    match User::delete_by_id(id, state).await {
        Ok(_) => Status::Ok,
        Err(_) => Status::Forbidden,
    }
}