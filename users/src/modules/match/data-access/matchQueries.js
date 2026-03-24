// File to write the queries required for the matches management
module.exports = {
  createMatch: `
    INSERT INTO matches (blue_player_id, red_player_id, is_bot, bot_difficulty, status)
    VALUES ($1, $2, $3, $4, 'in_progress')
    RETURNING *; 
   `
};