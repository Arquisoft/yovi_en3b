use crate::{Coordinates, GameY, Movement, PlayerId, YBot};
use rand::prelude::IndexedRandom;

pub struct MediumBot;

impl YBot for MediumBot {
    fn name(&self) -> &str {
        "medium_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available_cells = board.available_cells();
        if available_cells.is_empty() {
            return None;
        }

        // Get bots team
        let my_player = board.next_player()?;
        
        // Assign the players team (blue or read) acording to the bots team
        let opponent = if my_player.id() == 0 {
            PlayerId::new(1)
        } else {
            PlayerId::new(0)
        };

        let board_size = board.board_size();

        // 1. Check if the bot has a winning moovement (Same as EasyBot)
        for &cell_idx in available_cells {
            let coords = Coordinates::from_index(cell_idx, board_size);
            let mut simulated_board = board.clone();
            let movement = Movement::Placement { player: my_player, coords };
            
            if simulated_board.add_move(movement).is_ok() && simulated_board.check_game_over() {
                return Some(coords);
            }
        }

        // 2. Check if the player has a winning moovement (Same as EasyBot)
        for &cell_idx in available_cells {
            let coords = Coordinates::from_index(cell_idx, board_size);
            let mut simulated_board = board.clone();
            let movement = Movement::Placement { player: opponent, coords };
            
            if simulated_board.add_move(movement).is_ok() && simulated_board.check_game_over() {
                return Some(coords);
            }
        }

        // 3. If no immediate win/block, use Flat Monte Carlo simulations
        let mut best_move = None;
        let mut max_wins = -1;
        
        // Number of random games to simulate per available cell
        // 30 is enough to make sense, but low enough to be "medium" and fast
        let simulations_per_move = 30; 

        for &cell_idx in available_cells {
            let coords = Coordinates::from_index(cell_idx, board_size);
            let mut wins_for_this_cell = 0;

            for _ in 0..simulations_per_move {
                let mut simulated_board = board.clone();
                
                // The bot makes its hypothetical move
                let _ = simulated_board.add_move(Movement::Placement { 
                    player: my_player, 
                    coords 
                });

                // Play random moves until the game is over
                while !simulated_board.check_game_over() {
                    let current_turn = simulated_board.next_player().unwrap();
                    let sim_available = simulated_board.available_cells();
                    
                    if sim_available.is_empty() { break; }

                    let random_cell = sim_available.choose(&mut rand::rng()).unwrap();
                    let random_coords = Coordinates::from_index(*random_cell, board_size);

                    let _ = simulated_board.add_move(Movement::Placement {
                        player: current_turn,
                        coords: random_coords,
                    });
                }

                // Check who won the simulated game
                if let crate::GameStatus::Finished { winner } = simulated_board.status() {
                    if *winner == my_player {
                        wins_for_this_cell += 1;
                    }
                }
            }

            // If this cell has more wins than the previous ones, save it
            if wins_for_this_cell > max_wins {
                max_wins = wins_for_this_cell;
                best_move = Some(coords);
            }
        }

        best_move
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{GameY, Movement, Coordinates};

    #[test]
    fn test_medium_bot_name() {
        // Comprobamos que devuelve su nombre correctamente
        let bot = MediumBot;
        assert_eq!(bot.name(), "medium_bot");
    }

    #[test]
    fn test_medium_bot_first_move() {
        // 1. Tablero vacío (usamos tamaño 3 o 4 para que las simulaciones de Monte Carlo sean rápidas en el test)
        let board = GameY::new(3); 
        let bot = MediumBot;

        // 2. Le pedimos que piense su primer movimiento
        let chosen_move = bot.choose_move(&board);
        
        // 3. Comprobamos que devuelve algo
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_medium_bot_mid_game() {
        // 1. Empezamos una partida
        let mut board = GameY::new(3);
        let bot = MediumBot;

        // 2. Simulamos un par de movimientos usando las celdas disponibles
        let available = board.available_cells();
        let first_cell = Coordinates::from_index(available[0], board.board_size());
        let second_cell = Coordinates::from_index(available[1], board.board_size());

        // Juega el jugador 0
        let p0 = board.next_player().unwrap();
        board.add_move(Movement::Placement {
            player: p0,
            coords: first_cell.clone(),
        }).unwrap();

        // Juega el jugador 1
        let p1 = board.next_player().unwrap();
        board.add_move(Movement::Placement {
            player: p1,
            coords: second_cell.clone(),
        }).unwrap();

        // 3. Le toca al bot pensar (aquí ejecutará sus simulaciones de Monte Carlo)
        let chosen_move = bot.choose_move(&board);
        assert!(chosen_move.is_some());

        // 4. Verificamos que respeta las reglas y no pisa celdas ocupadas
        let chosen_coords = chosen_move.unwrap();
        assert_ne!(chosen_coords, first_cell);
        assert_ne!(chosen_coords, second_cell);
    }
}