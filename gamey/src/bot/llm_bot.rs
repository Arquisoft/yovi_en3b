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

/// Difficulty levels for the LLM Anthropic bot.
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
pub struct AnthropicRequest {
    pub model: String,
    pub max_tokens: u32,
    pub messages: Vec<AnthropicMessage>,
}

#[derive(Debug, Serialize)]
pub struct AnthropicMessage {
    pub role: String,
    pub content: String,
}

/// Response structure from Anthropic API
#[derive(Debug, Deserialize)]
pub struct AnthropicResponse {
    pub content: Vec<AnthropicContent>,
}

#[derive(Debug, Deserialize)]
pub struct AnthropicContent {
    pub text: String,
}

/// Anthropic Claude API client for move decisions and hints
pub struct AnthropicClient {
    pub api_key: String,
    pub client: reqwest::Client,
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

    /// Get a free-form chat response from the LLM using a caller-provided prompt.
    pub async fn get_chat_response(&self, prompt: &str) -> Result<String, String> {
        self.call_anthropic_text(prompt).await
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
        self.should_make_random_move_with_value(random_value)
    }

    /// Decide whether to make a random move given a sampled value (0-100)
    fn should_make_random_move_with_value(&self, random_value: f32) -> bool {
        let probability = self.difficulty.random_move_probability();
        random_value < probability
    }
}

impl YBot for LLMBot {
    fn name(&self) -> &str {
        &self.name
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let random_value: f32 = rand::rng().random::<f32>() * 100.0;
        self.choose_move_with_random_value(board, random_value)
    }
}

impl LLMBot {
    fn choose_move_with_random_value(
        &self,
        board: &GameY,
        random_value: f32,
    ) -> Option<Coordinates> {
        // Synchronous fallback: just make a random move with difficulty applied
        let available_cells = board.available_cells();
        if available_cells.is_empty() {
            return None;
        }

        if self.should_make_random_move_with_value(random_value) {
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
    fn test_difficulty_level_clone_and_copy() {
        let easy = DifficultyLevel::Easy;
        let medium = DifficultyLevel::Medium;
        let hard = DifficultyLevel::Hard;

        // Test Copy trait
        let easy_copy = easy;
        assert_eq!(easy, easy_copy);

        // Test Clone trait
        let medium_clone = medium.clone();
        assert_eq!(medium, medium_clone);

        let hard_clone = hard.clone();
        assert_eq!(hard, hard_clone);
    }

    #[test]
    fn test_difficulty_level_debug_impl() {
        let easy_debug = format!("{:?}", DifficultyLevel::Easy);
        let medium_debug = format!("{:?}", DifficultyLevel::Medium);
        let hard_debug = format!("{:?}", DifficultyLevel::Hard);

        assert!(easy_debug.contains("Easy"));
        assert!(medium_debug.contains("Medium"));
        assert!(hard_debug.contains("Hard"));
    }

    #[test]
    fn test_difficulty_level_partial_eq() {
        assert_eq!(DifficultyLevel::Easy, DifficultyLevel::Easy);
        assert_eq!(DifficultyLevel::Medium, DifficultyLevel::Medium);
        assert_eq!(DifficultyLevel::Hard, DifficultyLevel::Hard);

        assert_ne!(DifficultyLevel::Easy, DifficultyLevel::Medium);
        assert_ne!(DifficultyLevel::Easy, DifficultyLevel::Hard);
        assert_ne!(DifficultyLevel::Medium, DifficultyLevel::Hard);
    }

    #[test]
    fn test_anthropic_client_creation() {
        let client = AnthropicClient::new("test_api_key".to_string());
        assert_eq!(client.api_key, "test_api_key");
    }

    #[test]
    fn test_anthropic_client_with_empty_key() {
        let client = AnthropicClient::new("".to_string());
        assert_eq!(client.api_key, "");
    }

    #[test]
    fn test_anthropic_client_with_long_key() {
        let long_key = "k".repeat(10000);
        let client = AnthropicClient::new(long_key.clone());
        assert_eq!(client.api_key, long_key);
    }

    #[test]
    fn test_anthropic_request_creation() {
        let request = AnthropicRequest {
            model: "claude-3-5-sonnet-20241022".to_string(),
            max_tokens: 100,
            messages: vec![AnthropicMessage {
                role: "user".to_string(),
                content: "test".to_string(),
            }],
        };

        assert_eq!(request.model, "claude-3-5-sonnet-20241022");
        assert_eq!(request.max_tokens, 100);
        assert_eq!(request.messages.len(), 1);
        assert_eq!(request.messages[0].role, "user");
    }

    #[test]
    fn test_anthropic_message_structure() {
        let message = AnthropicMessage {
            role: "assistant".to_string(),
            content: "Hello, I'm Claude".to_string(),
        };

        assert_eq!(message.role, "assistant");
        assert_eq!(message.content, "Hello, I'm Claude");
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

    #[test]
    fn test_llm_bot_creation_all_difficulties() {
        let bot_easy = LLMBot::new(
            "easy".to_string(),
            DifficultyLevel::Easy,
            "key".to_string(),
        );
        let bot_medium = LLMBot::new(
            "medium".to_string(),
            DifficultyLevel::Medium,
            "key".to_string(),
        );
        let bot_hard = LLMBot::new(
            "hard".to_string(),
            DifficultyLevel::Hard,
            "key".to_string(),
        );

        assert_eq!(bot_easy.difficulty(), DifficultyLevel::Easy);
        assert_eq!(bot_medium.difficulty(), DifficultyLevel::Medium);
        assert_eq!(bot_hard.difficulty(), DifficultyLevel::Hard);
    }

    #[test]
    fn test_llm_bot_name_getter() {
        let names = vec!["bot1", "bot2", "my_custom_bot", ""];
        for name in names {
            let bot = LLMBot::new(name.to_string(), DifficultyLevel::Medium, "key".to_string());
            assert_eq!(bot.name(), name);
        }
    }

    #[test]
    fn test_llm_bot_difficulty_getter() {
        let difficulties = vec![
            DifficultyLevel::Easy,
            DifficultyLevel::Medium,
            DifficultyLevel::Hard,
        ];
        for difficulty in difficulties {
            let bot = LLMBot::new("bot".to_string(), difficulty, "key".to_string());
            assert_eq!(bot.difficulty(), difficulty);
        }
    }

    #[test]
    fn test_llm_bot_implements_ybot_trait() {
        let bot: Box<dyn YBot> = Box::new(LLMBot::new(
            "trait_bot".to_string(),
            DifficultyLevel::Medium,
            "key".to_string(),
        ));

        assert_eq!(bot.name(), "trait_bot");
        // Can call choose_move through trait
        assert!(bot.name().len() > 0);
    }

    #[test]
    fn test_should_make_random_move_with_value() {
        let bot = LLMBot::new(
            "bot".to_string(),
            DifficultyLevel::Easy,
            "key".to_string(),
        );

        // Easy has 20% probability
        assert!(bot.should_make_random_move_with_value(0.0));
        assert!(bot.should_make_random_move_with_value(19.9));
        assert!(!bot.should_make_random_move_with_value(20.0));
        assert!(!bot.should_make_random_move_with_value(100.0));
    }

    #[test]
    fn test_choose_move_with_empty_board_returns_none() {
        use crate::{GameY, YEN};

        let board = GameY::try_from(YEN::new(1, 0, vec!['B', 'R'], "B".to_string()))
            .expect("Failed to create board");
        let bot = LLMBot::new("bot".to_string(), DifficultyLevel::Medium, "key".to_string());

        assert!(bot.choose_move(&board).is_none());
    }

    #[test]
    fn test_choose_move_single_cell_board_is_deterministic() {
        use crate::{GameY, YEN};

        let board = GameY::try_from(YEN::new(1, 0, vec!['B', 'R'], ".".to_string()))
            .expect("Failed to create board");
        let bot = LLMBot::new("bot".to_string(), DifficultyLevel::Hard, "key".to_string());

        let chosen = bot.choose_move(&board).expect("Expected a move");
        assert_eq!(chosen, Coordinates::new(0, 0, 0));
    }

    #[test]
    fn test_choose_move_with_random_value_branches() {
        use crate::{GameY, YEN};

        let board = GameY::try_from(YEN::new(1, 0, vec!['B', 'R'], ".".to_string()))
            .expect("Failed to create board");
        let bot = LLMBot::new("bot".to_string(), DifficultyLevel::Easy, "key".to_string());

        let chosen_random = bot
            .choose_move_with_random_value(&board, 0.0)
            .expect("Expected a move for random branch");
        let chosen_default = bot
            .choose_move_with_random_value(&board, 100.0)
            .expect("Expected a move for default branch");

        assert_eq!(chosen_random, Coordinates::new(0, 0, 0));
        assert_eq!(chosen_default, Coordinates::new(0, 0, 0));
    }

    #[test]
    fn test_multiple_llm_bots_independent() {
        let bot1 = LLMBot::new(
            "bot1".to_string(),
            DifficultyLevel::Easy,
            "key1".to_string(),
        );
        let bot2 = LLMBot::new(
            "bot2".to_string(),
            DifficultyLevel::Hard,
            "key2".to_string(),
        );

        // Verify they are independent
        assert_ne!(bot1.name(), bot2.name());
        assert_ne!(bot1.difficulty(), bot2.difficulty());
    }

    #[test]
    fn test_format_board_state() {
        let client = AnthropicClient::new("key".to_string());
        
        use crate::{GameY, YEN};
        let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
        let board = GameY::try_from(yen).expect("Failed to create board");
        
        let board_state = client.format_board_state(&board);
        
        assert!(board_state.contains("Total cells"));
        assert!(board_state.contains("Available cells"));
    }

    #[test]
    fn test_format_board_state_different_sizes() {
        let client = AnthropicClient::new("key".to_string());
        
        use crate::{GameY, YEN};
        
        let board2 = GameY::try_from(YEN::new(2, 0, vec!['B', 'R'], "./..".to_string()))
            .expect("Failed to create board");
        let board3 = GameY::try_from(YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string()))
            .expect("Failed to create board");
        
        let state2 = client.format_board_state(&board2);
        let state3 = client.format_board_state(&board3);
        
        // Different board sizes should produce different states
        assert_ne!(state2, state3);
        assert!(state2.len() > 0);
        assert!(state3.len() > 0);
    }
}
