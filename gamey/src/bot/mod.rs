//! Bot module for the Game of Y.
//!
//! This module provides the infrastructure for creating and managing AI bots
//! that can play the Game of Y. It includes:
//!
//! - [`YBot`] - A trait that defines the interface for synchronous bots
//! - [`YBotAsync`] - A trait that defines the interface for asynchronous bots
//! - [`YBotRegistry`] - A registry for managing multiple bot implementations
//! - [`RandomBot`] - A simple bot that makes random valid moves
//! - [`LLMBot`] - An LLM-powered bot with difficulty levels and strategic decision making

pub mod random;
pub mod ybot;
pub mod ybot_registry;
pub mod llm_bot;
pub use random::*;
pub use ybot::*;
pub use ybot_registry::*;
pub use llm_bot::{*, LLMBot, DifficultyLevel, AnthropicClient, AnthropicRequest, AnthropicMessage};
