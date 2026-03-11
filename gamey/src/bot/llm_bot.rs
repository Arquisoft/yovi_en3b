//! LLM-based bot implementation with difficulty levels using Anthropic Claude.
//!
//! This module provides [`LLMBot`], a bot powered by Anthropic's Claude API that can:
//! - Play with different difficulty levels (Easy: 20%, Medium: 10%, Hard: 3% random moves)
//! - Provide strategic hints using the same LLM decision making
//! - Make intelligent moves based on game analysis

use crate::{Coordinates, GameY, YBot};
use rand::prelude::IndexedRandom;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// Difficulty levels for the LLM bot.
#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum DifficultyLevel {
    /// Easy mode: 20% chance of random moves
    Easy,
    /// Medium mode: 10% chance of random moves
    Medium,
    /// Hard mode: 3% chance of random moves
    Hard,
}

impl DifficultyLevel {
    /// Get the random move probability as a percentage (0-100)
    pub fn random_move_probability(&self) -> f32 {
        match self {
            DifficultyLevel::Easy => 20.0,
            DifficultyLevel::Medium => 10.0,
            DifficultyLevel::Hard => 3.0,
        }
    }
}

/// Request structure for Anthropic API
#[derive(Debug, Serialize)]
struct AnthropicRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<AnthropicMessage>,
}

#[derive(Debug, Serialize)]
struct AnthropicMessage {
    role: String,
    content: String,
}

/// Response structure from Anthropic API
#[derive(Debug, Deserialize)]
struct AnthropicResponse {
    content: Vec<AnthropicContent>,
}

#[derive(Debug, Deserialize)]
struct AnthropicContent {
    text: String,
}

/// Anthropic Claude API client for move decisions and hints
pub struct AnthropicClient {
    api_key: String,
    client: reqwest::Client,
}

impl AnthropicClient {
    /// Create a new Anthropic client with the given API key
    pub fn new(api_key: String) -> Self {
        AnthropicClient {
            api_key,
            client: reqwest::Client::new(),
        }
    }

    /// Get a strategic move from Claude
    pub async fn get_move_decision(
        &self,
        board: &GameY,
        available_moves: Vec<Coordinates>,
    ) -> Result<Option<Coordinates>, String> {
        if available_moves.is_empty() {
            return Ok(None);
        }

        let board_state = self.format_board_state(board);
        let available_coords = available_moves
            .iter()
            .map(|c| format!("({}, {}, {})", c.x(), c.y(), c.z()))
            .collect::<Vec<_>>()
            .join(", ");

        let prompt = format!(
            "You are an expert Game of Y player. Given the current board state and available moves, \
             choose the BEST strategic move. Respond with ONLY the coordinates in format: x,y,z (e.g., 1,0,0)\n\n\
             Board size: {}\nAvailable moves: [{}]\n{}\n\n\
             Best move coordinates (x,y,z format only):",
            board.board_size(),
            available_coords,
            board_state
        );

        self.call_anthropic(&prompt).await
    }

    /// Get a strategic hint for the current game position
    pub async fn get_hint(&self, board: &GameY) -> Result<String, String> {
        let board_state = self.format_board_state(board);
        let available_moves = board.available_cells().len();

        let prompt = format!(
            "You are an expert Game of Y strategist. Analyze this board state and provide \
             ONE concise strategic hint (max 50 words) for the current player.\n\n\
             Board size: {}\nAvailable moves: {}\n{}\n\n\
             Strategic hint:",
            board.board_size(),
            available_moves,
            board_state
        );

        self.call_anthropic_text(&prompt).await
    }

    async fn call_anthropic(&self, prompt: &str) -> Result<Option<Coordinates>, String> {
        let response_text = self.call_anthropic_text(prompt).await?;
        
        // Parse response in format "x,y,z"
        let trimmed = response_text.trim().trim_matches(|c| c == '(' || c == ')');
        let parts: Vec<&str> = trimmed.split(',').collect();
        
        if parts.len() != 3 {
            return Err(format!("Invalid coordinate format from Claude: {}", response_text));
        }

        let x = parts[0]
            .trim()
            .parse::<u32>()
            .map_err(|_| "Failed to parse x coordinate".to_string())?;
        let y = parts[1]
            .trim()
            .parse::<u32>()
            .map_err(|_| "Failed to parse y coordinate".to_string())?;
        let z = parts[2]
            .trim()
            .parse::<u32>()
            .map_err(|_| "Failed to parse z coordinate".to_string())?;

        Ok(Some(Coordinates::new(x, y, z)))
    }

    async fn call_anthropic_text(&self, prompt: &str) -> Result<String, String> {
        let request = AnthropicRequest {
            model: "claude-3-5-sonnet-20241022".to_string(),
            max_tokens: 100,
            messages: vec![AnthropicMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
        };

        let response = self
            .client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| format!("Failed to call Anthropic API: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Anthropic API error: {}", error_text));
        }

        let data: AnthropicResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Anthropic response: {}", e))?;

        if data.content.is_empty() {
            return Err("Empty response from Claude".to_string());
        }

        Ok(data.content[0].text.clone())
    }

    fn format_board_state(&self, board: &GameY) -> String {
        let cells = board.available_cells();
        format!(
            "Total cells: {}, Available cells: {}",
            (board.board_size() * (board.board_size() + 1)) / 2,
            cells.len()
        )
    }
}

/// LLM-powered bot with difficulty levels and decision making
pub struct LLMBot {
    name: String,
    difficulty: DifficultyLevel,
    #[allow(dead_code)]
    llm_client: Arc<AnthropicClient>,
}

impl LLMBot {
    /// Create a new LLM bot with the specified difficulty
    pub fn new(
        name: String,
        difficulty: DifficultyLevel,
        api_key: String,
    ) -> Self {
        LLMBot {
            name,
            difficulty,
            llm_client: Arc::new(AnthropicClient::new(api_key)),
        }
    }

    /// Get the difficulty level
    pub fn difficulty(&self) -> DifficultyLevel {
        self.difficulty
    }

    /// Decide whether to make a random move based on difficulty
    fn should_make_random_move(&self) -> bool {
        let probability = self.difficulty.random_move_probability();
        let mut rng = rand::rng();
        let random_value: f32 = rng.random::<f32>() * 100.0;
        random_value < probability
    }
}

impl YBot for LLMBot {
    fn name(&self) -> &str {
        &self.name
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        // Synchronous fallback: just make a random move with difficulty applied
        let available_cells = board.available_cells();
        if available_cells.is_empty() {
            return None;
        }

        if self.should_make_random_move() {
            let mut rng = rand::rng();
            let cell = available_cells.choose(&mut rng)?;
            let coordinates = Coordinates::from_index(*cell, board.board_size());
            return Some(coordinates);
        }

        // Default to a random move (will be overridden by async in endpoints)
        let mut rng = rand::rng();
        let cell = available_cells.choose(&mut rng)?;
        Some(Coordinates::from_index(*cell, board.board_size()))
    }
}



#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_difficulty_random_probabilities() {
        assert_eq!(DifficultyLevel::Easy.random_move_probability(), 20.0);
        assert_eq!(DifficultyLevel::Medium.random_move_probability(), 10.0);
        assert_eq!(DifficultyLevel::Hard.random_move_probability(), 3.0);
    }

    #[test]
    fn test_llm_bot_creation() {
        let bot = LLMBot::new(
            "test_bot".to_string(),
            DifficultyLevel::Easy,
            "test_key".to_string(),
        );
        assert_eq!(bot.name(), "test_bot");
        assert_eq!(bot.difficulty(), DifficultyLevel::Easy);
    }
}
