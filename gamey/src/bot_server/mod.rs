//! HTTP server for Y game bots.
//!
//! This module provides an Axum-based REST API for querying Y game bots.
//! The server exposes endpoints for checking bot status and requesting moves.
//!
//! # Endpoints
//! - `GET /status` - Health check endpoint
//! - `POST /{api_version}/ybot/choose/{bot_id}` - Request a move from a bot
//! - `POST /{api_version}/ybot/hint` - Get a strategic hint with difficulty consideration
//! - `GET /{api_version}/play` - Let a bot make a move and get the new game state
//!
//! # Example
//! ```no_run
//! use gamey::run_bot_server;
//!
//! #[tokio::main]
//! async fn main() {
//!     if let Err(e) = run_bot_server(3000).await {
//!         eprintln!("Server error: {}", e);
//!     }
//! }
//! ```

pub mod chat;
pub mod choose;
pub mod error;
pub mod hint;
pub mod play;
pub mod state;
pub mod version;
use axum::response::IntoResponse;
pub use chat::{ChatMessage, ChatRequest, ChatResponse};
pub use choose::MoveResponse;
pub use error::ErrorResponse;
pub use hint::{HintResponse, generate_strategic_hint};
pub use play::PlayResponse;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
pub use version::*;

use crate::{
    DifficultyLevel, GameYError, LLMBot, RandomBot, YBotRegistry,
    bot::llm_bot::resolve_llm_api_key, state::AppState,
};

/// Creates the Axum router with the given state.
///
/// This is useful for testing the API without binding to a network port.
pub fn create_router(state: AppState) -> axum::Router {
    axum::Router::new()
        .route("/status", axum::routing::get(status))
        .route(
            "/{api_version}/ybot/choose/{bot_id}",
            axum::routing::post(choose::choose),
        )
        .route(
            "/{api_version}/ybot/hint",
            axum::routing::post(hint::get_hint),
        )
        .route(
            "/{api_version}/ybot/chat/{bot_id}",
            axum::routing::post(chat::chat_with_bot),
        )
        .route(
            "/{api_version}/play",
            axum::routing::get(play::play),
        )
        .layer(CorsLayer::permissive())
        .with_state(state)
}

/// Creates the default application state with the standard bot registry.
///
/// The default state includes the `RandomBot` which selects moves randomly.
/// If `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) is set, LLM bots with
/// different difficulty levels are also included.
pub fn create_default_state() -> AppState {
    let _ = dotenv::dotenv();

    let mut bots = YBotRegistry::new().with_bot(Arc::new(RandomBot));

    // Add LLM bots if API key is available
    if let Some(api_key) = resolve_llm_api_key() {
        bots = bots
            .with_bot(Arc::new(LLMBot::new(
                "llm_bot".to_string(),
                DifficultyLevel::Medium,
                api_key.clone(),
            )))
            .with_bot(Arc::new(LLMBot::new(
                "llm-easy".to_string(),
                DifficultyLevel::Easy,
                api_key.clone(),
            )))
            .with_bot(Arc::new(LLMBot::new(
                "llm-medium".to_string(),
                DifficultyLevel::Medium,
                api_key.clone(),
            )))
            .with_bot(Arc::new(LLMBot::new(
                "llm-hard".to_string(),
                DifficultyLevel::Hard,
                api_key,
            )));
    }

    AppState::new(bots)
}

/// Starts the bot server on the specified port.
///
/// This function blocks until the server is shut down.
///
/// # Arguments
/// * `port` - The TCP port to listen on
///
/// # Errors
/// Returns `GameYError::ServerError` if:
/// - The TCP port cannot be bound (e.g., port already in use, permission denied)
/// - The server encounters an error while running
pub async fn run_bot_server(port: u16) -> Result<(), GameYError> {
    let state = create_default_state();
    let app = create_router(state);

    let addr = format!("0.0.0.0:{}", port);
    let listener =
        tokio::net::TcpListener::bind(&addr)
            .await
            .map_err(|e| GameYError::ServerError {
                message: format!("Failed to bind to {}: {}", addr, e),
            })?;

    println!("Server mode: Listening on http://{}", addr);
    axum::serve(listener, app)
        .await
        .map_err(|e| GameYError::ServerError {
            message: format!("Server error: {}", e),
        })?;

    Ok(())
}

/// Health check endpoint handler.
///
/// Returns "OK" to indicate the server is running.
pub async fn status() -> impl IntoResponse {
    "OK"
}
