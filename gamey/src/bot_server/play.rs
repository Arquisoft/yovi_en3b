use crate::{Coordinates, GameY, YEN, check_api_version, error::ErrorResponse, state::AppState, Movement};
use axum::{
    Json,
    extract::{Query, State},
};
use serde::{Deserialize, Serialize};

/// Query parameters for the play endpoint.
#[derive(Deserialize)]
pub struct PlayParams {
    /// The API version (e.g., "v1").
    api_version: String,
    /// The game state in YEN format as a JSON string.
    yen: String,
    /// Optional bot type (defaults to "llm").
    #[serde(default = "default_bot_type")]
    bot_type: String,
    /// Optional difficulty level (defaults to "medium").
    #[serde(default = "default_difficulty")]
    difficulty: String,
}

fn default_bot_type() -> String {
    "llm".to_string()
}

fn default_difficulty() -> String {
    "medium".to_string()
}

/// Response returned by the play endpoint on success.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct PlayResponse {
    /// The API version used for this request.
    pub api_version: String,
    /// The bot type that made the move.
    pub bot_type: String,
    /// The difficulty level used.
    pub difficulty: String,
    /// The coordinates where the bot placed its piece.
    pub coords: Coordinates,
    /// The new game state in YEN format after the move.
    pub new_yen: YEN,
}

/// Handler for the play endpoint.
///
/// This endpoint accepts a game state in YEN format via query parameters,
/// lets a bot choose and apply a move, then returns the new game state.
///
/// # Route
/// `GET /{api_version}/play`
///
/// # Query Parameters
/// - `yen`: Game state in YEN format as JSON string
/// - `bot_type`: Bot type (optional, defaults to "llm")
/// - `difficulty`: Difficulty level (optional, defaults to "medium")
///
/// # Response
/// On success, returns a `PlayResponse` with the move and new game state.
/// On failure, returns an `ErrorResponse` with details about what went wrong.
#[axum::debug_handler]
pub async fn play(
    State(state): State<AppState>,
    Query(params): Query<PlayParams>,
) -> Result<Json<PlayResponse>, Json<ErrorResponse>> {
    check_api_version(&params.api_version)?;

    // Parse the YEN from the query parameter
    let yen: YEN = match serde_json::from_str(&params.yen) {
        Ok(yen) => yen,
        Err(err) => {
            return Err(Json(ErrorResponse::error(
                &format!("Invalid YEN JSON: {}", err),
                Some(params.api_version.clone()),
                None,
            )));
        }
    };

    // Convert YEN to GameY
    let mut game_y = match GameY::try_from(yen) {
        Ok(game) => game,
        Err(err) => {
            return Err(Json(ErrorResponse::error(
                &format!("Invalid YEN format: {}", err),
                Some(params.api_version.clone()),
                None,
            )));
        }
    };

    // Determine bot ID based on type and difficulty
    let bot_id = match params.bot_type.as_str() {
        "llm" => match params.difficulty.as_str() {
            "easy" => "llm-easy",
            "medium" => "llm-medium",
            "hard" => "llm-hard",
            _ => "llm-medium",
        },
        "random" => "random",
        _ => "llm-medium",
    };

    // Get the bot
    let bot = match state.bots().find(&bot_id) {
        Some(bot) => bot,
        None => {
            let available_bots = state.bots().names().join(", ");
            return Err(Json(ErrorResponse::error(
                &format!(
                    "Bot not found: {}, available bots: [{}]",
                    bot_id, available_bots
                ),
                Some(params.api_version.clone()),
                Some(bot_id.to_string()),
            )));
        }
    };

    // Let the bot choose a move using choose_move
    let coords = match bot.choose_move(&game_y) {
        Some(coords) => coords,
        None => {
            return Err(Json(ErrorResponse::error(
                "No valid moves available for the bot",
                Some(params.api_version.clone()),
                Some(bot_id.to_string()),
            )));
        }
    };

    // Apply the move to the game
    let movement = Movement::Place(coords);
    if let Err(err) = game_y.add_move(movement) {
        return Err(Json(ErrorResponse::error(
            &format!("Failed to apply move: {}", err),
            Some(params.api_version.clone()),
            Some(bot_id.to_string()),
        )));
    }

    // Convert back to YEN
    let new_yen = match YEN::try_from(&game_y) {
        Ok(yen) => yen,
        Err(err) => {
            return Err(Json(ErrorResponse::error(
                &format!("Failed to convert game to YEN: {}", err),
                Some(params.api_version.clone()),
                Some(bot_id.to_string()),
            )));
        }
    };

    let response = PlayResponse {
        api_version: params.api_version,
        bot_type: params.bot_type,
        difficulty: params.difficulty,
        coords,
        new_yen,
    };

    Ok(Json(response))
}