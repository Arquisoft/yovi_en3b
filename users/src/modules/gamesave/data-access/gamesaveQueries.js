// File to write the queries required for the game saves management
module.exports = {
  createGameSave: `
    INSERT INTO game_saves (match_id, move_number, player_id, move_coordinates, resulting_board_state)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `,
  findGameSavesByMatch: `
    SELECT * FROM game_saves 
    WHERE match_id = $1 
    ORDER BY move_number ASC
  `,
  findGameSavesByMatchAndMove: `
    SELECT * FROM game_saves 
    WHERE match_id = $1 AND move_number = $2
   `,
  findLastGameSaveByMatch: `
    SELECT * FROM game_saves 
    WHERE match_id = $1 
    ORDER BY move_number DESC 
    LIMIT 1
   `
};