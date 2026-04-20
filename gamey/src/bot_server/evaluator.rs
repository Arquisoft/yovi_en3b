use axum::{Json, extract::Path};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

use crate::{
    Coordinates, GameY, PlayerId, YEN,
    bot_server::{check_api_version, error::ErrorResponse},
};

/// Parámetros de la URL
#[derive(Deserialize)]
pub struct EvaluateParams {
    pub api_version: String,
}

/// Respuesta devuelta a Node.js / React
#[derive(Serialize)]
pub struct EvaluateResponse {
    pub blue_score: i32,
    pub red_score: i32,
}

/// Controlador principal de la ruta
#[axum::debug_handler]
pub async fn evaluate_handler(
    Path(params): Path<EvaluateParams>,
    Json(yen): Json<YEN>,
) -> Result<Json<EvaluateResponse>, Json<ErrorResponse>> {
    
    // 1. Validar la versión de la API
    check_api_version(&params.api_version)?;
    
    // 2. Parsear el estado del tablero desde YEN
    let board = match GameY::try_from(yen) {
        Ok(b) => b,
        Err(err) => {
            return Err(Json(ErrorResponse::error(
                &format!("Invalid YEN format: {}", err),
                Some(params.api_version),
                None,
            )));
        }
    };

    // Vuestros IDs de jugador (0 para Azul, 1 para Rojo)
    let blue_id = PlayerId::new(0);
    let red_id = PlayerId::new(1);

    // 3. Calcular los movimientos restantes usando Dijkstra
    let blue_distance = min_moves_to_win(&board, blue_id);
    let red_distance = min_moves_to_win(&board, red_id);

    // 4. Invertir la puntuación (máximo 25 puntos teóricos)
    let max_distance: i32 = 25; 
    
    // Si la distancia es u32::MAX significa que está bloqueado y no puede ganar (0 puntos)
    let blue_score = if blue_distance == u32::MAX { 0 } else { std::cmp::max(0, max_distance - blue_distance as i32) };
    let red_score = if red_distance == u32::MAX { 0 } else { std::cmp::max(0, max_distance - red_distance as i32) };

    Ok(Json(EvaluateResponse {
        blue_score,
        red_score,
    }))
}

// =====================================================================
// ALGORITMO DE EVALUACIÓN COPIADO Y AISLADO (0-1 BFS / DIJKSTRA)
// =====================================================================

fn min_moves_to_win(board: &GameY, player: PlayerId) -> u32 {
    let size = board.board_size();
    let total = (size * (size + 1)) / 2;

    let dist_a = shortest_paths(board, player, 0); 
    let dist_b = shortest_paths(board, player, 1); 
    let dist_c = shortest_paths(board, player, 2); 

    let mut min_total_moves = u32::MAX;

    for idx in 0..total {
        let da = dist_a[idx as usize];
        let db = dist_b[idx as usize];
        let dc = dist_c[idx as usize];

        if da == u32::MAX || db == u32::MAX || dc == u32::MAX { continue; }

        let coords = Coordinates::from_index(idx, size);
        let owner = board.player_at(&coords);
        
        let discount = if owner == None { 2 } else { 0 }; 

        let total_dist = da + db + dc;
        let actual_moves = total_dist.saturating_sub(discount);

        if actual_moves < min_total_moves {
            min_total_moves = actual_moves;
        }
    }
    
    min_total_moves
}

fn shortest_paths(board: &GameY, player: PlayerId, side: u8) -> Vec<u32> {
    let size = board.board_size();
    let total = (size * (size + 1)) / 2;
    let mut dists = vec![u32::MAX; total as usize];
    let mut deque = VecDeque::new();

    for idx in 0..total {
        let coords = Coordinates::from_index(idx, size);
        let touches_side = match side {
            0 => coords.x() == 0,
            1 => coords.y() == 0,
            2 => coords.z() == 0,
            _ => false,
        };

        if touches_side {
            let owner = board.player_at(&coords);
            if owner == Some(player) {
                dists[idx as usize] = 0;
                deque.push_front(idx);
            } else if owner == None {
                dists[idx as usize] = 1;
                deque.push_back(idx);
            }
        }
    }

    while let Some(curr_idx) = deque.pop_front() {
        let curr_dist = dists[curr_idx as usize];
        let coords = Coordinates::from_index(curr_idx, size);

        let x = coords.x(); let y = coords.y(); let z = coords.z();
        let mut neighbors = Vec::new();
        if x > 0 { neighbors.push(Coordinates::new(x - 1, y + 1, z)); neighbors.push(Coordinates::new(x - 1, y, z + 1)); }
        if y > 0 { neighbors.push(Coordinates::new(x + 1, y - 1, z)); neighbors.push(Coordinates::new(x, y - 1, z + 1)); }
        if z > 0 { neighbors.push(Coordinates::new(x + 1, y, z - 1)); neighbors.push(Coordinates::new(x, y + 1, z - 1)); }

        for n in neighbors {
            let n_idx = n.to_index(size);
            let n_owner = board.player_at(&n);

            if n_owner == Some(player) {
                if curr_dist < dists[n_idx as usize] {
                    dists[n_idx as usize] = curr_dist;
                    deque.push_front(n_idx);
                }
            } else if n_owner == None {
                if curr_dist + 1 < dists[n_idx as usize] {
                    dists[n_idx as usize] = curr_dist + 1;
                    deque.push_back(n_idx);
                }
            }
        }
    }
    
    dists
}