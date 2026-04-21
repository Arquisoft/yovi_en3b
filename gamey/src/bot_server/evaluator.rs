use axum::{Json, extract::Path};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

use crate::{
    Coordinates, GameY, PlayerId, YEN,
    bot_server::{check_api_version, error::ErrorResponse},
};

/// URL Parameters
#[derive(Deserialize)]
pub struct EvaluateParams {
    pub api_version: String,
}

/// Response returned to Node.js / React
#[derive(Serialize)]
pub struct EvaluateResponse {
    pub blue_score: i32,
    pub red_score: i32,
}

/// Main route handler for board evaluation
#[axum::debug_handler]
pub async fn evaluate_handler(
    Path(params): Path<EvaluateParams>,
    Json(yen): Json<YEN>,
) -> Result<Json<EvaluateResponse>, Json<ErrorResponse>> {
    
    // 1. Validate API version
    check_api_version(&params.api_version)?;
    
    // 2. Parse board state from YEN format
    let board = GameY::try_from(yen).map_err(|err| {
        Json(ErrorResponse::error(
            &format!("Invalid YEN format: {}", err),
            Some(params.api_version),
            None,
        ))
    })?;

    // 3. Calculate remaining moves using Dijkstra (0 for Blue, 1 for Red)
    let blue_dist = min_moves_to_win(&board, PlayerId::new(0));
    let red_dist = min_moves_to_win(&board, PlayerId::new(1));

    // 4. Invert score (theoretical max is 25 points)
    let max_distance: i32 = 25; 
    
    Ok(Json(EvaluateResponse {
        blue_score: calculate_score(blue_dist, max_distance),
        red_score: calculate_score(red_dist, max_distance),
    }))
}

/// Helper function to safely calculate the tension score
fn calculate_score(distance: u32, max_distance: i32) -> i32 {
    if distance == u32::MAX { 
        0 
    } else { 
        std::cmp::max(0, max_distance - distance as i32) 
    }
}

// =====================================================================
// EVALUATION ALGORITHM (0-1 BFS / DIJKSTRA)
// =====================================================================

fn min_moves_to_win(board: &GameY, player: PlayerId) -> u32 {
    let size = board.board_size();
    let total = (size * (size + 1)) / 2;

    // Fetch distances for all 3 sides in a single array
    let dists = [
        shortest_paths(board, player, 0),
        shortest_paths(board, player, 1),
        shortest_paths(board, player, 2),
    ];

    let mut min_total_moves = u32::MAX;

    for idx in 0..total as usize {
        let (da, db, dc) = (dists[0][idx], dists[1][idx], dists[2][idx]);

        // Skip if any side is unreachable
        if da == u32::MAX || db == u32::MAX || dc == u32::MAX { continue; }

        let coords = Coordinates::from_index(idx as u32, size);
        let discount = if board.player_at(&coords).is_none() { 2 } else { 0 }; 
        
        let actual_moves = (da + db + dc).saturating_sub(discount);
        min_total_moves = min_total_moves.min(actual_moves);
    }
    
    min_total_moves
}

fn shortest_paths(board: &GameY, player: PlayerId, side: u8) -> Vec<u32> {
    let size = board.board_size();
    let total = (size * (size + 1)) / 2;
    let mut dists = vec![u32::MAX; total as usize];
    let mut deque = VecDeque::new();

    // 1. Initialization phase
    init_bfs_deque(board, player, side, &mut dists, &mut deque);

    // 2. Main BFS loop
    while let Some(curr_idx) = deque.pop_front() {
        let curr_dist = dists[curr_idx as usize];
        let coords = Coordinates::from_index(curr_idx, size);

        for n in get_neighbors(&coords) {
            let n_idx = n.to_index(size) as usize;
            let is_owned = board.player_at(&n) == Some(player);
            let is_empty = board.player_at(&n).is_none();
            
            if is_owned && curr_dist < dists[n_idx] {
                dists[n_idx] = curr_dist;
                deque.push_front(n_idx as u32);
            } else if is_empty && curr_dist + 1 < dists[n_idx] {
                dists[n_idx] = curr_dist + 1;
                deque.push_back(n_idx as u32);
            }
        }
    }
    dists
}

fn init_bfs_deque(board: &GameY, player: PlayerId, side: u8, dists: &mut [u32], deque: &mut VecDeque<u32>) {
    let size = board.board_size();
    
    for idx in 0..((size * (size + 1)) / 2) {
        let coords = Coordinates::from_index(idx, size);
        
        let touches_side = match side {
            0 => coords.x() == 0,
            1 => coords.y() == 0,
            2 => coords.z() == 0,
            _ => false,
        };

        if touches_side {
            match board.player_at(&coords) {
                Some(p) if p == player => {
                    dists[idx as usize] = 0;
                    deque.push_front(idx);
                }
                None => {
                    dists[idx as usize] = 1;
                    deque.push_back(idx);
                }
                _ => {}
            }
        }
    }
}

fn get_neighbors(coords: &Coordinates) -> Vec<Coordinates> {
    let (x, y, z) = (coords.x(), coords.y(), coords.z());
    let mut neighbors = Vec::with_capacity(6);
    
    // Condense push statements using extend
    if x > 0 { 
        neighbors.extend([Coordinates::new(x - 1, y + 1, z), Coordinates::new(x - 1, y, z + 1)]); 
    }
    if y > 0 { 
        neighbors.extend([Coordinates::new(x + 1, y - 1, z), Coordinates::new(x, y - 1, z + 1)]); 
    }
    if z > 0 { 
        neighbors.extend([Coordinates::new(x + 1, y, z - 1), Coordinates::new(x, y + 1, z - 1)]); 
    }
    
    neighbors
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{GameY, PlayerId, YEN};
    use std::convert::TryFrom;

    /// Helper function to avoid repeating JSON/YEN casting in every test
    fn create_board_from_yen(yen_str: &str) -> GameY {
        let json_str = format!(
            r#"{{"size": 4, "turn": 1, "players": ["B", "R"], "layout": "{}"}}"#, 
            yen_str
        );
        let yen: YEN = serde_json::from_str(&json_str).expect("Failed to parse mock JSON");
        GameY::try_from(yen).expect("Failed to create GameY board from YEN")
    }

    #[test]
    fn test_empty_board_equal_tension() {
        // ARRANGE: Empty board of size 4
        let board = create_board_from_yen("./../.../....");
        let blue_id = PlayerId::new(0);
        let red_id = PlayerId::new(1);

        // ACT
        let blue_dist = min_moves_to_win(&board, blue_id);
        let red_dist = min_moves_to_win(&board, red_id);

        // ASSERT: On an empty board, both should have the exact same mathematical distance
        assert_eq!(blue_dist, red_dist, "Distance should be identical on an empty board");
        assert!(blue_dist > 0, "Distance cannot be 0 if no one has won yet");
    }

    #[test]
    fn test_mid_game_tension_advantage() {
        // ARRANGE: The exact network case that resulted in Blue: 24, Red: 23
        let board = create_board_from_yen("B/.B/RB./B..R");
        let blue_id = PlayerId::new(0);
        let red_id = PlayerId::new(1);

        // ACT
        let blue_dist = min_moves_to_win(&board, blue_id);
        let red_dist = min_moves_to_win(&board, red_id);

        // ASSERT: Blue should have less distance (more tension/points) than Red
        assert!(blue_dist < red_dist, "Blue is winning, its distance should be lower");
        
        let max_distance = 25;
        assert_eq!(calculate_score(blue_dist, max_distance), 24, "Blue score must be exactly 24");
        assert_eq!(calculate_score(red_dist, max_distance), 23, "Red score must be exactly 23");
    }

    #[test]
    fn test_blocked_player_zero_score() {
        // ARRANGE: A board where a player is completely blocked
        let board = create_board_from_yen("B/BB/BBB/BBBB"); 
        let red_id = PlayerId::new(1);

        // ACT
        let red_dist = min_moves_to_win(&board, red_id);

        // ASSERT: If impossible to win, distance is MAX
        assert_eq!(red_dist, u32::MAX, "Red is blocked, distance must be infinite (MAX)");
    }
}