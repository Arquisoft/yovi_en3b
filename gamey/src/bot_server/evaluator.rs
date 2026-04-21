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

    // 1. Fase de inicialización (Extraída para limpiar la función principal)
    init_bfs_deque(board, player, side, &mut dists, &mut deque);

    // 2. Bucle principal de BFS (Ahora mucho más plano)
    while let Some(curr_idx) = deque.pop_front() {
        let curr_dist = dists[curr_idx as usize];
        let coords = Coordinates::from_index(curr_idx, size);

        for n in get_neighbors(&coords) {
            let n_idx = n.to_index(size) as usize;
            
            // Hemos fusionado los "if" anidados usando "&&" para reducir el "nesting"
            if board.player_at(&n) == Some(player) && curr_dist < dists[n_idx] {
                dists[n_idx] = curr_dist;
                deque.push_front(n_idx as u32);
            } else if board.player_at(&n) == None && curr_dist + 1 < dists[n_idx] {
                dists[n_idx] = curr_dist + 1;
                deque.push_back(n_idx as u32);
            }
        }
    }
    
    dists
}

// ------------

fn init_bfs_deque(board: &GameY, player: PlayerId, side: u8, dists: &mut [u32], deque: &mut VecDeque<u32>) {
    let size = board.board_size();
    let total = (size * (size + 1)) / 2;

    for idx in 0..total {
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
    let x = coords.x();
    let y = coords.y();
    let z = coords.z();
    let mut neighbors = Vec::with_capacity(6);
    
    if x > 0 { 
        neighbors.push(Coordinates::new(x - 1, y + 1, z)); 
        neighbors.push(Coordinates::new(x - 1, y, z + 1)); 
    }
    if y > 0 { 
        neighbors.push(Coordinates::new(x + 1, y - 1, z)); 
        neighbors.push(Coordinates::new(x, y - 1, z + 1)); 
    }
    if z > 0 { 
        neighbors.push(Coordinates::new(x + 1, y, z - 1)); 
        neighbors.push(Coordinates::new(x, y + 1, z - 1)); 
    }
    
    neighbors
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{GameY, PlayerId, YEN};
    use std::convert::TryFrom;

    // Helper function para no repetir el casteo de JSON/YEN en cada test
    fn create_board_from_yen(yen_str: &str) -> GameY {
        // Ajusta la creación del tipo YEN según cómo esté definido en tu proyecto.
        // Asumo que YEN implementa From<&str> o similar.
        // Si YEN es un struct simple: YEN { layout: yen_str.to_string() }
        
        // Usamos un volcado directo JSON simulando la petición de React
        let json_str = format!(
            r#"{{"size": 4, "turn": 1, "players": ["B", "R"], "layout": "{}"}}"#, 
            yen_str
        );
        let yen: YEN = serde_json::from_str(&json_str).expect("Fallo al parsear JSON mock");
        
        GameY::try_from(yen).expect("Fallo al crear el tablero GameY desde YEN")
    }

    #[test]
    fn test_empty_board_equal_tension() {
        // ARRANGE: Tablero vacío de tamaño 4
        let board = create_board_from_yen("./../.../....");
        let blue_id = PlayerId::new(0);
        let red_id = PlayerId::new(1);

        // ACT
        let blue_dist = min_moves_to_win(&board, blue_id);
        let red_dist = min_moves_to_win(&board, red_id);

        // ASSERT: En un tablero vacío, ambos deberían estar a la misma distancia matemática
        assert_eq!(blue_dist, red_dist, "En un tablero vacío, la distancia debería ser idéntica");
        assert!(blue_dist > 0, "La distancia no puede ser 0 si no han ganado");
    }

    #[test]
    fn test_mid_game_tension_advantage() {
        // ARRANGE: El caso exacto que probamos en red y dio Blue: 24, Red: 23
        let board = create_board_from_yen("B/.B/RB./B..R");
        let blue_id = PlayerId::new(0);
        let red_id = PlayerId::new(1);

        // ACT
        let blue_dist = min_moves_to_win(&board, blue_id);
        let red_dist = min_moves_to_win(&board, red_id);

        // ASSERT: Azul debería tener menor distancia (más tensión/puntos) que Rojo
        assert!(blue_dist < red_dist, "El Azul va ganando, su distancia debería ser menor");
        
        // Verificamos los cálculos exactos de nuestro max_distance (25)
        let max_distance = 25;
        let blue_score = std::cmp::max(0, max_distance - blue_dist as i32);
        let red_score = std::cmp::max(0, max_distance - red_dist as i32);
        
        assert_eq!(blue_score, 24, "El score de Azul debe ser exactamente 24 en este layout");
        assert_eq!(red_score, 23, "El score de Rojo debe ser exactamente 23 en este layout");
    }

    #[test]
    fn test_blocked_player_zero_score() {
        // ARRANGE: Un tablero donde un jugador ya no puede ganar de ninguna manera.
        // Aquí llenamos una línea entera bloqueando el paso, simulando un u32::MAX en la distancia
        // Nota: Asegúrate de poner un layout válido donde uno esté totalmente bloqueado
        let board = create_board_from_yen("B/BB/BBB/BBBB"); 
        let red_id = PlayerId::new(1);

        // ACT
        let red_dist = min_moves_to_win(&board, red_id);

        // ASSERT: Si es imposible ganar, la distancia es MAX
        assert_eq!(red_dist, u32::MAX, "El Rojo está bloqueado, su distancia debe ser infinita (MAX)");
    }
}