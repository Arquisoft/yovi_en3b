use crate::{Coordinates, GameY, Movement, PlayerId, YBot};
use rand::prelude::IndexedRandom;

pub struct EasyBot;

impl YBot for EasyBot {
    fn name(&self) -> &str {
        "easy_bot"
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


        // Check if the bot has a winning moovement
        let board_size = board.board_size();
        for &cell_idx in available_cells {
            let coords = Coordinates::from_index(cell_idx, board_size);
            
            let mut simulated_board = board.clone();
            
            let movement = Movement::Placement {
                player: my_player,
                coords,
            };
            
            // If it has one, it places it
            if simulated_board.add_move(movement).is_ok() && simulated_board.check_game_over() {
                return Some(coords);
            }
        }

        // Check if the player has a winning moovement
        for &cell_idx in available_cells {
            let coords = Coordinates::from_index(cell_idx, board_size);

            let mut simulated_board = board.clone();
            
            let movement = Movement::Placement {
                player: opponent,
                coords,
            };
            
            // If he has one, the bot places in it so that the player can't win
            if simulated_board.add_move(movement).is_ok() && simulated_board.check_game_over() {
                return Some(coords);
            }
        }

        // If no one can win in this turn,
        let cell = available_cells.choose(&mut rand::rng())?;
        Some(Coordinates::from_index(*cell, board_size))
    }
}