use gamey::{Coordinates, GameY, Movement, YBot};
// Asegúrate de que las rutas de importación coinciden con cómo tenéis exportados los bots en vuestro lib.rs
use gamey::bot::easy::EasyBot;
use gamey::bot::medium::MediumBot;

/// Esta es la función MAESTRA. Acepta cualquier cosa que sea un YBot.
fn run_standard_bot_tests(bot: &dyn YBot, expected_name: &str) {
    // 1. Test del Nombre
    assert_eq!(bot.name(), expected_name);

    // 2. Test del primer movimiento (Tablero vacío)
    let board = GameY::new(3);
    let chosen_move = bot.choose_move(&board);
    assert!(chosen_move.is_some(), "El bot falló al intentar hacer el primer movimiento");

    // 3. Test a mitad de partida
    let mut board = GameY::new(3);
    let available = board.available_cells();
    let first_cell = Coordinates::from_index(available[0], board.board_size());
    let second_cell = Coordinates::from_index(available[1], board.board_size());

    // Ficha del Jugador 0
    let p0 = board.next_player().unwrap();
    board.add_move(Movement::Placement {
        player: p0,
        coords: first_cell.clone(),
    }).unwrap();

    // Ficha del Jugador 1
    let p1 = board.next_player().unwrap();
    board.add_move(Movement::Placement {
        player: p1,
        coords: second_cell.clone(),
    }).unwrap();

    // El bot piensa su movimiento
    let chosen_move = bot.choose_move(&board);
    assert!(chosen_move.is_some(), "El bot falló a mitad de partida");

    // Comprobamos que no hace trampas
    let chosen_coords = chosen_move.unwrap();
    assert_ne!(chosen_coords, first_cell, "¡El bot intentó pisar la primera ficha!");
    assert_ne!(chosen_coords, second_cell, "¡El bot intentó pisar la segunda ficha!");
}

// --- Y aquí simplemente llamamos a la función maestra para cada bot ---

#[test]
fn test_easy_bot_standard_behavior() {
    let bot = EasyBot;
    run_standard_bot_tests(&bot, "easy_bot");
}

#[test]
fn test_medium_bot_standard_behavior() {
    let bot = MediumBot;
    run_standard_bot_tests(&bot, "medium_bot");
}

/* Cuando arregléis el HardBot, solo tendréis que añadir esto:
#[test]
fn test_hard_bot_standard_behavior() {
    let bot = HardBot;
    run_standard_bot_tests(&bot, "hard_bot");
}
*/