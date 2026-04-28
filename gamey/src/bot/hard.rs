use crate::{Coordinates, GameY, Movement, PlayerId, YBot};
use std::collections::VecDeque; // (for DIJKASTRA) 

pub struct HardBot;

const SEARCH_DEPTH: u8 = 3; // The number of turns it simulates before each moovement
const WIN_SCORE: i32 = 10000;
const LOSE_SCORE: i32 = -10000;

impl YBot for HardBot {
    fn name(&self) -> &str {
        "hard_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();
        if available_cells.is_empty() {
            return None;
        }

        let my_player = board.next_player()?;
        let board_size = board.board_size();
        
        let mut best_move = None;
        let mut best_score = std::i32::MIN;

        // Alfa-Beta prunning (bot-rival)
        let mut alpha = std::i32::MIN;
        let beta = std::i32::MAX;

        // We try each possible moovement for this turn
        for &cell_idx in available_cells {
            let coords = Coordinates::from_index(cell_idx, board_size);
            let mut simulated_board = board.clone();
            
            let movement = Movement::Placement {
                player: my_player,
                coords,
            };

            if simulated_board.add_move(movement).is_ok() {
                // We use MINIMAX function for this moovement
                let score = minimax(
                    &simulated_board, 
                    SEARCH_DEPTH - 1, 
                    alpha, 
                    beta, 
                    false, // set false because will next check the rival (beta) (the human player :| ) moovement
                    my_player
                );

                // We compare the results
                if score > best_score {
                    best_score = score;
                    best_move = Some(coords);
                }

                // Update alpha
                alpha = alpha.max(best_score);
            }
        }

        // If there is no way of winning, it just returns the first cell
        best_move.or_else(|| {
            let first_cell = available_cells[0];
            Some(Coordinates::from_index(first_cell, board_size))
        })
    }
}

/// the minimax function
fn minimax(
    board: &GameY, 
    depth: u8, 
    mut alpha: i32, 
    mut beta: i32, 
    is_maximizing: bool,
    bot_player: PlayerId
) -> i32 {
    // Check if the game is finished and, if so, stop
    if board.check_game_over() {
        if let crate::GameStatus::Finished { winner } = board.status() {
            if *winner == bot_player {
                return WIN_SCORE + depth as i32; // Sumamos depth para que prefiera ganar rápido
            } else {
                return LOSE_SCORE - depth as i32; // Restamos depth para que alargue la derrota lo máximo posible
            }
        }
    }

    let available_cells = board.available_cells();
    
    // Check if the board is full and, if so, stop
    if available_cells.is_empty() || depth == 0 {
        return evaluate_board(board, bot_player);
    }

    let current_player = board.next_player().unwrap();
    let board_size = board.board_size();

    if is_maximizing {
        let mut max_eval = std::i32::MIN;
        for &cell_idx in available_cells {
            let coords = Coordinates::from_index(cell_idx, board_size);
            let mut next_board = board.clone();
            
            let _ = next_board.add_move(Movement::Placement { player: current_player, coords });
            
            let eval = minimax(&next_board, depth - 1, alpha, beta, false, bot_player);
            max_eval = max_eval.max(eval);
            alpha = alpha.max(eval);
            
            // If the beta (human player) would already be "favoriced" eith this moove, we stop looking
            if beta <= alpha {
                break;
            }
        }
        max_eval
    } else {
        let mut min_eval = std::i32::MAX;
        for &cell_idx in available_cells {
            let coords = Coordinates::from_index(cell_idx, board_size);
            let mut next_board = board.clone();
            
            let _ = next_board.add_move(Movement::Placement { player: current_player, coords });
            
            let eval = minimax(&next_board, depth - 1, alpha, beta, true, bot_player);
            min_eval = min_eval.min(eval);
            beta = beta.min(eval);
            
            // We compare again the "points" of the bot (alpha) against the ones of the player (beta)
            if beta <= alpha {
                break;
            }
        }
        min_eval
    }
}


/// Heuristic funciton: Too determine who is "wining" at each moment of the game (when the game is not over))
/// Dijkastra algorithm


/// Función Heurística: Búsqueda del camino más corto (0-1 BFS).
/// Calcula cuántas fichas necesita poner cada jugador para conectar los 3 lados.
fn evaluate_board(board: &GameY, bot_player: PlayerId) -> i32 {
    let opponent = if bot_player.id() == 0 { PlayerId::new(1) } else { PlayerId::new(0) };

    let bot_moves = min_moves_to_win(board, bot_player);
    let opp_moves = min_moves_to_win(board, opponent);

    // Si alguien no puede ganar de ninguna forma (el rival le ha bloqueado), le damos la peor puntuación
    let bot_score = if bot_moves == u32::MAX { -10000 } else { -(bot_moves as i32) };
    let opp_score = if opp_moves == u32::MAX { -10000 } else { -(opp_moves as i32) };

    // Queremos minimizar nuestros movimientos para ganar, y maximizar los del oponente.
    // Si nosotros necesitamos 2 movimientos (-2) y el rival 5 (-5), la puntuación será +3 (¡Vamos ganando!)
    bot_score - opp_score
}

/// Calcula el número mínimo de casillas vacías que un jugador necesita capturar para conectar A, B y C.
fn min_moves_to_win(board: &GameY, player: PlayerId) -> u32 {
    let size = board.board_size();
    let total = (size * (size + 1)) / 2;

    // Calculamos la distancia desde CADA casilla del tablero hasta cada uno de los 3 lados
    let dist_a = shortest_paths(board, player, 0); // Lado A (x == 0)
    let dist_b = shortest_paths(board, player, 1); // Lado B (y == 0)
    let dist_c = shortest_paths(board, player, 2); // Lado C (z == 0)

    let mut min_total_moves = u32::MAX;

    // Buscamos cuál es el "punto de encuentro" óptimo (la casilla) para conectar los 3 caminos
    for idx in 0..total {
        let da = dist_a[idx as usize];
        let db = dist_b[idx as usize];
        let dc = dist_c[idx as usize];

        // Si la casilla no puede llegar a los 3 lados, la ignoramos
        if da == u32::MAX || db == u32::MAX || dc == u32::MAX { continue; }

        let coords = Coordinates::from_index(idx, size);
        let owner = board.player_at(&coords);
        
        // Si la casilla de encuentro está vacía, los 3 caminos la han contado (ha costado 3 en total). 
        // Solo necesitamos poner 1 ficha ahí, así que le restamos 2 al total.
        let discount = if owner == None { 2 } else { 0 }; 

        let total_dist = da + db + dc;
        let actual_moves = total_dist.saturating_sub(discount);

        if actual_moves < min_total_moves {
            min_total_moves = actual_moves;
        }
    }
    
    min_total_moves
}

/// Algoritmo 0-1 BFS: Distancia mínima desde un lado concreto a todo el tablero
fn shortest_paths(board: &GameY, player: PlayerId, side: u8) -> Vec<u32> {
    let size = board.board_size();
    let total = (size * (size + 1)) / 2;
    let mut dists = vec![u32::MAX; total as usize];
    let mut deque = VecDeque::new();

    // 1. Iniciamos la búsqueda desde todas las casillas que tocan el borde objetivo
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
                deque.push_front(idx); // Nuestras fichas cuestan 0, van al principio de la cola
            } else if owner == None {
                dists[idx as usize] = 1;
                deque.push_back(idx); // Las vacías cuestan 1, van al final
            }
        }
    }

    // 2. Expandimos la búsqueda por el resto del tablero
    while let Some(curr_idx) = deque.pop_front() {
        let curr_dist = dists[curr_idx as usize];
        let coords = Coordinates::from_index(curr_idx, size);

        // Obtenemos los vecinos manualmente para no depender de métodos privados
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
                    dists[n_idx as usize] = curr_dist; // Coste 0
                    deque.push_front(n_idx);
                }
            } else if n_owner == None {
                if curr_dist + 1 < dists[n_idx as usize] {
                    dists[n_idx as usize] = curr_dist + 1; // Coste 1
                    deque.push_back(n_idx);
                }
            }
        }
    }
    
    dists
}



// TESTS:
/*
#[cfg(test)]
mod tests {
    use super::*;
    use crate::{GameY, GameStatus, Movement, PlayerId, RandomBot};

    #[test]
    fn test_hard_bot_beats_random_bot_full_game() {
        // Creamos un tablero de tamaño 5 (ni muy grande ni muy pequeño)
        let mut game = GameY::new(5);
        
        let hard_bot = HardBot;
        let random_bot = RandomBot;

        // HardBot será el jugador 0 (Azul), RandomBot será el jugador 1 (Rojo)
        let hard_player_id = PlayerId::new(0);
        let random_player_id = PlayerId::new(1);

        println!("Empezando simulación: HardBot vs RandomBot...");

        // Bucle principal de la partida
        while !game.check_game_over() {
            let current_player = game.next_player().unwrap();
            
            // Decidimos qué bot debe jugar este turno
            let coords = if current_player == hard_player_id {
                hard_bot.choose_move(&game).expect("HardBot no encontró movimiento")
            } else {
                random_bot.choose_move(&game).expect("RandomBot no encontró movimiento")
            };

            // Aplicamos el movimiento al tablero
            game.add_move(Movement::Placement {
                player: current_player,
                coords,
            }).unwrap();
        }

        // La partida ha terminado. Comprobamos quién es el ganador.
        if let GameStatus::Finished { winner } = game.status() {
            // Imprimimos el tablero final en la consola para verlo si falla
            println!("Estado final del tablero:");
            let options = crate::RenderOptions {
                show_3d_coords: false,
                show_idx: false,
                show_colors: false,
            };
            println!("{}", game.render(&options));

            // ¡El test solo pasará (verde) si el ganador es nuestro HardBot!
            assert_eq!(
                *winner, hard_player_id, 
                "¡Desastre! El HardBot ha perdido contra el RandomBot."
            );
        } else {
            panic!("La partida terminó pero no hay un ganador claro.");
        }
    }
}
*/