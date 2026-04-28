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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{GameY, Movement, Coordinates};

    #[test]
    fn test_easy_bot_name() {
        // Test de cortesía súper rápido para asegurar que el nombre es correcto 
        // (y rascar un poco más de % de cobertura gratis)
        let bot = EasyBot;
        assert_eq!(bot.name(), "easy_bot");
    }

    #[test]
    fn test_easy_bot_first_move() {
        // 1. Empezamos una partida nueva (tablero vacío)
        let board = GameY::new(4); // Puedes cambiar el 4 por el tamaño por defecto que uséis
        let bot = EasyBot;

        // 2. Le pedimos al bot que mueva
        let chosen_move = bot.choose_move(&board);
        
        // 3. Comprobamos que sabe qué hacer y devuelve una coordenada válida
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_easy_bot_mid_game() {
        // 1. Creamos la partida y el bot
        let mut board = GameY::new(4);
        let bot = EasyBot;

        // 2. Simulamos que ya se han puesto un par de fichas en el tablero.
        // Cogemos las dos primeras celdas libres para no tener que inventar coordenadas.
        let available = board.available_cells();
        let first_cell = Coordinates::from_index(available[0], board.board_size());
        let second_cell = Coordinates::from_index(available[1], board.board_size());

        // Mueve el Jugador 0
        let p0 = board.next_player().unwrap();
        board.add_move(Movement::Placement {
            player: p0,
            coords: first_cell.clone(),
        }).unwrap();

        // Mueve el Jugador 1
        let p1 = board.next_player().unwrap();
        board.add_move(Movement::Placement {
            player: p1,
            coords: second_cell.clone(),
        }).unwrap();

        // 3. Le toca al bot elegir su movimiento
        let chosen_move = bot.choose_move(&board);
        assert!(chosen_move.is_some());

        // 4. Comprobación vital: El bot NO debe intentar poner su ficha 
        // encima de las que ya pusimos en los pasos anteriores.
        let chosen_coords = chosen_move.unwrap();
        assert_ne!(chosen_coords, first_cell);
        assert_ne!(chosen_coords, second_cell);
    }
}