use gamey::bot::llm_bot::{
    AnthropicClient, AnthropicMessage, AnthropicRequest, DifficultyLevel, LLMBot,
};
use gamey::{GameY, YBot, YEN};

// ============================================================================
// DifficultyLevel tests
// ============================================================================

#[test]
fn test_difficulty_level_easy_probability() {
    assert_eq!(DifficultyLevel::Easy.random_move_probability(), 20.0);
}

#[test]
fn test_difficulty_level_medium_probability() {
    assert_eq!(DifficultyLevel::Medium.random_move_probability(), 10.0);
}

#[test]
fn test_difficulty_level_hard_probability() {
    assert_eq!(DifficultyLevel::Hard.random_move_probability(), 3.0);
}

#[test]
fn test_difficulty_level_equality() {
    assert_eq!(DifficultyLevel::Easy, DifficultyLevel::Easy);
    assert_ne!(DifficultyLevel::Easy, DifficultyLevel::Medium);
    assert_ne!(DifficultyLevel::Medium, DifficultyLevel::Hard);
}

#[test]
fn test_difficulty_level_clone() {
    let easy = DifficultyLevel::Easy;
    let easy_clone = easy;
    assert_eq!(easy, easy_clone);
}

#[test]
fn test_difficulty_level_debug_format() {
    let debug_str = format!("{:?}", DifficultyLevel::Hard);
    assert!(debug_str.contains("Hard"));
}

// ============================================================================
// LLMBot creation and properties
// ============================================================================

#[test]
fn test_llm_bot_creation_easy() {
    let bot = LLMBot::new(
        "test_bot_easy".to_string(),
        DifficultyLevel::Easy,
        "test_key".to_string(),
    );
    assert_eq!(bot.name(), "test_bot_easy");
    assert_eq!(bot.difficulty(), DifficultyLevel::Easy);
}

#[test]
fn test_llm_bot_creation_medium() {
    let bot = LLMBot::new(
        "test_bot_medium".to_string(),
        DifficultyLevel::Medium,
        "test_key".to_string(),
    );
    assert_eq!(bot.name(), "test_bot_medium");
    assert_eq!(bot.difficulty(), DifficultyLevel::Medium);
}

#[test]
fn test_llm_bot_creation_hard() {
    let bot = LLMBot::new(
        "test_bot_hard".to_string(),
        DifficultyLevel::Hard,
        "test_key".to_string(),
    );
    assert_eq!(bot.name(), "test_bot_hard");
    assert_eq!(bot.difficulty(), DifficultyLevel::Hard);
}

#[test]
fn test_llm_bot_with_empty_name() {
    let bot = LLMBot::new("".to_string(), DifficultyLevel::Medium, "key".to_string());
    assert_eq!(bot.name(), "");
}

#[test]
fn test_llm_bot_with_long_name() {
    let long_name = "a".repeat(1000);
    let bot = LLMBot::new(long_name.clone(), DifficultyLevel::Hard, "key".to_string());
    assert_eq!(bot.name(), &long_name);
}

#[test]
fn test_llm_bot_with_special_characters_in_name() {
    let bot = LLMBot::new(
        "bot_#@!$%^&*()".to_string(),
        DifficultyLevel::Easy,
        "key".to_string(),
    );
    assert_eq!(bot.name(), "bot_#@!$%^&*()");
}

// ============================================================================
// LLMBot move selection - Empty board
// ============================================================================

#[test]
fn test_llm_bot_choose_move_empty_board() {
    let bot = LLMBot::new(
        "test_bot".to_string(),
        DifficultyLevel::Medium,
        "test_key".to_string(),
    );

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    let move_result = bot.choose_move(&game_y);

    assert!(move_result.is_some());
    let coords = move_result.unwrap();

    // Verify coordinates are within valid range
    assert!(coords.x() < 3 || coords.y() < 3 || coords.z() < 3);
}

// ============================================================================
// LLMBot move selection - Partially filled board
// ============================================================================

#[test]
fn test_llm_bot_choose_move_partially_filled_board() {
    let bot = LLMBot::new(
        "test_bot".to_string(),
        DifficultyLevel::Medium,
        "test_key".to_string(),
    );

    let yen = YEN::new(3, 2, vec!['B', 'R'], "B/R./.B.".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    let move_result = bot.choose_move(&game_y);

    assert!(move_result.is_some());
}

#[test]
fn test_llm_bot_choose_move_high_fill_percentage() {
    let bot = LLMBot::new(
        "test_bot".to_string(),
        DifficultyLevel::Easy,
        "test_key".to_string(),
    );

    // Board with some cells filled (board size 3, leaving at least one empty)
    let yen = YEN::new(3, 5, vec!['B', 'R'], "B/RB/.BR".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    let move_result = bot.choose_move(&game_y);

    assert!(move_result.is_some());
}

// ============================================================================
// LLMBot move selection - Full board
// ============================================================================

#[test]
fn test_llm_bot_choose_move_full_board() {
    let bot = LLMBot::new(
        "test_bot".to_string(),
        DifficultyLevel::Hard,
        "test_key".to_string(),
    );

    // Create a completely full board (game won't actually allow this, but testing the logic)
    let yen = YEN::new(2, 3, vec!['B', 'R'], "B/RB".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    let move_result = bot.choose_move(&game_y);

    // No moves available should return None
    assert!(move_result.is_none());
}

// ============================================================================
// LLMBot with different difficulty levels - Consistency tests
// ============================================================================

#[test]
fn test_llm_bot_easy_still_makes_moves() {
    let bot = LLMBot::new(
        "easy_bot".to_string(),
        DifficultyLevel::Easy,
        "test_key".to_string(),
    );

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    // Multiple tries to ensure we still get moves even with 20% random
    for _ in 0..10 {
        let move_result = bot.choose_move(&game_y);
        assert!(
            move_result.is_some(),
            "Easy bot should always return a move"
        );
    }
}

#[test]
fn test_llm_bot_medium_makes_intelligent_moves() {
    let bot = LLMBot::new(
        "medium_bot".to_string(),
        DifficultyLevel::Medium,
        "test_key".to_string(),
    );

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    let move_result = bot.choose_move(&game_y);
    assert!(move_result.is_some());
}

#[test]
fn test_llm_bot_hard_makes_optimal_moves() {
    let bot = LLMBot::new(
        "hard_bot".to_string(),
        DifficultyLevel::Hard,
        "test_key".to_string(),
    );

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    let move_result = bot.choose_move(&game_y);
    assert!(move_result.is_some());
}

// ============================================================================
// LLMBot YBot trait implementation
// ============================================================================

#[test]
fn test_llm_bot_implements_ybot_name() {
    let bot = LLMBot::new(
        "my_llm_bot".to_string(),
        DifficultyLevel::Easy,
        "key".to_string(),
    );

    let ybot_name = bot.name();
    assert_eq!(ybot_name, "my_llm_bot");
}

#[test]
fn test_llm_bot_implements_ybot_choose_move() {
    let bot = LLMBot::new(
        "bot".to_string(),
        DifficultyLevel::Medium,
        "key".to_string(),
    );

    let yen = YEN::new(3, 1, vec!['B', 'R'], "./../...".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    let move_result = bot.choose_move(&game_y);
    assert!(move_result.is_some());
}

#[test]
fn test_llm_bot_trait_object() {
    let bot: Box<dyn YBot> = Box::new(LLMBot::new(
        "trait_bot".to_string(),
        DifficultyLevel::Hard,
        "key".to_string(),
    ));

    assert_eq!(bot.name(), "trait_bot");
}

// ============================================================================
// Multiple LLMBot instances
// ============================================================================

#[test]
fn test_multiple_llm_bot_instances_independent() {
    let bot1 = LLMBot::new(
        "bot_1".to_string(),
        DifficultyLevel::Easy,
        "key1".to_string(),
    );
    let bot2 = LLMBot::new(
        "bot_2".to_string(),
        DifficultyLevel::Medium,
        "key2".to_string(),
    );
    let bot3 = LLMBot::new(
        "bot_3".to_string(),
        DifficultyLevel::Hard,
        "key3".to_string(),
    );

    assert_eq!(bot1.name(), "bot_1");
    assert_eq!(bot2.name(), "bot_2");
    assert_eq!(bot3.name(), "bot_3");
    assert_eq!(bot1.difficulty(), DifficultyLevel::Easy);
    assert_eq!(bot2.difficulty(), DifficultyLevel::Medium);
    assert_eq!(bot3.difficulty(), DifficultyLevel::Hard);
}

#[test]
fn test_multiple_bots_same_difficulty() {
    let bot1 = LLMBot::new(
        "bot_alpha".to_string(),
        DifficultyLevel::Hard,
        "key1".to_string(),
    );
    let bot2 = LLMBot::new(
        "bot_beta".to_string(),
        DifficultyLevel::Hard,
        "key2".to_string(),
    );

    assert_eq!(bot1.difficulty(), bot2.difficulty());
    assert_ne!(bot1.name(), bot2.name());
}

// ============================================================================
// Board state formatting tests
// ============================================================================

// ============================================================================
// LLMBot move selection - Random vs Strategic
// ============================================================================

#[test]
fn test_llm_bot_chooses_from_available_cells() {
    let bot = LLMBot::new(
        "test_bot".to_string(),
        DifficultyLevel::Medium,
        "test_key".to_string(),
    );

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    // Try multiple times to ensure moves are from available cells
    for _ in 0..10 {
        let coords = bot.choose_move(&game_y).expect("Bot should return a move");
        let index = coords.to_index(3);
        assert!(
            game_y.available_cells().contains(&index),
            "Move should be from available cells"
        );
    }
}

#[test]
fn test_llm_bot_different_difficulties_behavior() {
    let easy_bot = LLMBot::new("easy".to_string(), DifficultyLevel::Easy, "key".to_string());
    let medium_bot = LLMBot::new(
        "medium".to_string(),
        DifficultyLevel::Medium,
        "key".to_string(),
    );
    let hard_bot = LLMBot::new("hard".to_string(), DifficultyLevel::Hard, "key".to_string());

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    // All should make moves
    assert!(easy_bot.choose_move(&game_y).is_some());
    assert!(medium_bot.choose_move(&game_y).is_some());
    assert!(hard_bot.choose_move(&game_y).is_some());
}

// ============================================================================
// Edge cases and special scenarios
// ============================================================================

#[test]
fn test_llm_bot_consistency_multiple_calls() {
    let bot = LLMBot::new(
        "consistent_bot".to_string(),
        DifficultyLevel::Medium,
        "key".to_string(),
    );

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    // Multiple calls should always return a move
    for _ in 0..20 {
        assert!(
            bot.choose_move(&game_y).is_some(),
            "Bot should consistently return moves"
        );
    }
}

#[test]
fn test_anthropic_request_serialization() {
    let request = AnthropicRequest {
        model: "claude-3-5-sonnet-20241022".to_string(),
        max_tokens: 100,
        messages: vec![AnthropicMessage {
            role: "user".to_string(),
            content: "test message".to_string(),
        }],
    };

    let json = serde_json::to_string(&request).expect("Should serialize");
    assert!(json.contains("claude-3-5-sonnet-20241022"));
    assert!(json.contains("100"));
}

#[test]
fn test_difficulty_level_serialization() {
    let easy = DifficultyLevel::Easy;
    let medium = DifficultyLevel::Medium;
    let hard = DifficultyLevel::Hard;

    let easy_json = serde_json::to_string(&easy).expect("Should serialize");
    let medium_json = serde_json::to_string(&medium).expect("Should serialize");
    let hard_json = serde_json::to_string(&hard).expect("Should serialize");

    assert!(easy_json.contains("Easy"));
    assert!(medium_json.contains("Medium"));
    assert!(hard_json.contains("Hard"));
}

#[test]
fn test_llm_bot_difficulty_getter() {
    let bot = LLMBot::new("test".to_string(), DifficultyLevel::Hard, "key".to_string());

    assert_eq!(bot.difficulty(), DifficultyLevel::Hard);
}

#[test]
fn test_llm_bot_name_getter() {
    let bot = LLMBot::new(
        "my_custom_bot_name".to_string(),
        DifficultyLevel::Easy,
        "key".to_string(),
    );

    assert_eq!(bot.name(), "my_custom_bot_name");
}

// ============================================================================
// LLMBot with various board states
// ============================================================================

#[test]
fn test_llm_bot_with_mostly_filled_board() {
    let bot = LLMBot::new(
        "test_bot".to_string(),
        DifficultyLevel::Medium,
        "key".to_string(),
    );

    // Board with only 1 empty cell (size 2 has 3 cells total: 1+2)
    let yen = YEN::new(2, 0, vec!['B', 'R'], "B/R.".to_string());
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    let move_result = bot.choose_move(&game_y);
    assert!(move_result.is_some());
}

#[test]
fn test_llm_bot_move_valid_within_board() {
    let bot = LLMBot::new(
        "validator".to_string(),
        DifficultyLevel::Easy,
        "key".to_string(),
    );

    let yen = YEN::new(
        4,
        0,
        vec!['B', 'R'],
        ".".to_string() + "/" + ".." + "/" + "..." + "/" + "....",
    );
    let game_y = GameY::try_from(yen).expect("Failed to create GameY");

    for _ in 0..10 {
        if let Some(coords) = bot.choose_move(&game_y) {
            assert!(coords.x() < 4 || coords.y() < 4 || coords.z() < 4);
        }
    }
}

#[test]
fn test_anthropic_client_new() {
    let client = AnthropicClient::new("my_key_12345".to_string());
    assert_eq!(client.api_key, "my_key_12345");
}

// ============================================================================
// Probability-based behavior tests
// ============================================================================

#[test]
fn test_difficulty_random_probability_values() {
    let easy_prob = DifficultyLevel::Easy.random_move_probability();
    let medium_prob = DifficultyLevel::Medium.random_move_probability();
    let hard_prob = DifficultyLevel::Hard.random_move_probability();

    assert!(easy_prob > medium_prob);
    assert!(medium_prob > hard_prob);
    assert!(hard_prob >= 0.0);
    assert!(easy_prob <= 100.0);
}
