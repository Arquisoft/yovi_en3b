use crate::{Coordinates, GameY, YEN, check_api_version, error::ErrorResponse, state::AppState};
use axum::{
    Json,
    extract::{Path, State},
};
use serde::{Deserialize, Serialize};

/// Request parameters for the hint endpoint
#[derive(Deserialize)]
pub struct HintParams {
    /// The API version (e.g., "v1")
    pub api_version: String,
    /// The difficulty level for the bot (easy, medium, hard)
    pub difficulty: Option<String>,
}

/// Response from the hint endpoint
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HintResponse {
    /// The API version used for this request
    pub api_version: String,
    /// The hint text provided by the LLM
    pub hint: String,
    /// The suggested best move
    pub suggested_move: Option<SuggestedMove>,
    /// The difficulty level that was used
    pub difficulty: String,
}

/// Suggested move from the LLM bot
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct SuggestedMove {
    /// X coordinate of the suggested move
    pub x: u32,
    /// Y coordinate of the suggested move
    pub y: u32,
    /// Z coordinate of the suggested move
    pub z: u32,
}

/// Handler for the hint endpoint.
///
/// This endpoint accepts a game state in YEN format and returns:
/// - A strategic hint analyzed by the LLM
/// - A suggested best move
/// - The difficulty level used for analysis
///
/// # Route
/// `POST /{api_version}/ybot/hint`
///
/// # Request Body
/// A JSON object in YEN format representing the current game state.
/// Optional difficulty parameter in URL: ?difficulty=easy|medium|hard
///
/// # Response
/// Returns a `HintResponse` with strategic advice and a suggested move.
#[axum::debug_handler]
pub async fn get_hint(
    State(_state): State<AppState>,
    Path(params): Path<HintParams>,
    Json(yen): Json<YEN>,
) -> Result<Json<HintResponse>, Json<ErrorResponse>> {
    check_api_version(&params.api_version)?;
    
    let game_y = match GameY::try_from(yen) {
        Ok(game) => game,
        Err(err) => {
            return Err(Json(ErrorResponse::error(
                &format!("Invalid YEN format: {}", err),
                Some(params.api_version.clone()),
                None,
            )));
        }
    };

    let difficulty = params.difficulty.as_deref().unwrap_or("medium");
    
    // Validate difficulty level
    if !["easy", "medium", "hard"].contains(&difficulty) {
        return Err(Json(ErrorResponse::error(
            "Invalid difficulty level. Use: easy, medium, hard",
            Some(params.api_version),
            None,
        )));
    }

    let available_cells = game_y.available_cells();
    if available_cells.is_empty() {
        return Err(Json(ErrorResponse::error(
            "No available moves to hint on",
            Some(params.api_version),
            None,
        )));
    }

    // For now, provide a strategic hint based on board analysis
    // In production, this would call the LLM for actual intelligent hints
    let hint = generate_strategic_hint(&game_y, difficulty);
    
    // Suggest the first available move (in production, LLM would choose the best)
    let first_available = available_cells[0];
    let coords = Coordinates::from_index(first_available, game_y.board_size());
    let suggested_move = SuggestedMove {
        x: coords.x(),
        y: coords.y(),
        z: coords.z(),
    };

    let response = HintResponse {
        api_version: params.api_version,
        hint,
        suggested_move: Some(suggested_move),
        difficulty: difficulty.to_string(),
    };

    Ok(Json(response))
}

/// Generate a strategic hint based on the board state
fn generate_strategic_hint(board: &GameY, difficulty: &str) -> String {
    let available = board.available_cells().len();
    let total_cells = (board.board_size() * (board.board_size() + 1)) / 2;
    let cells_filled = total_cells.saturating_sub(available as u32);
    let fill_percentage = (cells_filled as f32 / total_cells as f32) * 100.0;

    match difficulty {
        "easy" => format!(
            "Board is {}% filled. Try placing your piece in a central position to control territory.",
            fill_percentage as i32
        ),
        "medium" => format!(
            "With {}% of the board filled and {} cells available, focus on connecting with your existing pieces to form a line.",
            fill_percentage as i32, available
        ),
        "hard" => format!(
            "Critical position: {}% board fill, {} cells left. Analyze opponent's next move and block potential winning lines while forming your own connections.",
            fill_percentage as i32, available
        ),
        _ => "Consider your strategic position carefully.".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hint_response_creation() {
        let response = HintResponse {
            api_version: "v1".to_string(),
            hint: "Test hint".to_string(),
            suggested_move: Some(SuggestedMove {
                x: 1,
                y: 0,
                z: 0,
            }),
            difficulty: "medium".to_string(),
        };
        assert_eq!(response.api_version, "v1");
        assert_eq!(response.difficulty, "medium");
    }

    #[test]
    fn test_suggested_move_serialization() {
        let move_json = serde_json::json!({
            "x": 1,
            "y": 0,
            "z": 0,
        });
        let suggested_move: SuggestedMove = serde_json::from_value(move_json).unwrap();
        assert_eq!(suggested_move.x, 1);
        assert_eq!(suggested_move.y, 0);
        assert_eq!(suggested_move.z, 0);
    }
}
