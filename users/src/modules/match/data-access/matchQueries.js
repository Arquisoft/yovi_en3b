// File to write the queries required for the matches management
module.exports = {
  createMatch: `
    INSERT INTO matches (blue_player_id, red_player_id, is_bot, bot_difficulty, status)
    VALUES ($1, $2, $3, $4, 'in_progress')
    RETURNING *; 
   `,
   selectWherePlayerId: `
    SELECT * FROM matches 
    WHERE blue_player_id = $1 OR red_player_id = $1
    ORDER BY created_at DESC;
    `,
   selectHistoryWherePlayerId: `
    SELECT
      m.id,
      m.blue_player_id,
      m.red_player_id,
      m.is_bot,
      m.bot_difficulty,
      m.winner_id,
      m.status,
      m.created_at,
      m.ended_at,
      CASE
        WHEN m.is_bot THEN NULL
        WHEN m.blue_player_id = $1 THEN COALESCE(red_user.nickname, red_user.username)
        ELSE COALESCE(blue_user.nickname, blue_user.username)
      END AS opponent_name,
      CASE
        WHEN m.is_bot THEN NULL
        WHEN m.blue_player_id = $1 THEN red_user.photo
        ELSE blue_user.photo
      END AS opponent_avatar_id,
      ((latest_save.resulting_board_state ->> 'size')::int) AS board_size
    FROM matches m
    LEFT JOIN users blue_user ON blue_user.id = m.blue_player_id
    LEFT JOIN users red_user ON red_user.id = m.red_player_id
    LEFT JOIN LATERAL (
      SELECT resulting_board_state
      FROM game_saves gs
      WHERE gs.match_id = m.id
      ORDER BY gs.move_number DESC
      LIMIT 1
    ) latest_save ON true
    WHERE m.blue_player_id = $1 OR m.red_player_id = $1
    ORDER BY m.created_at DESC;
   `,
   getMatchById: `
    SELECT * FROM matches
    WHERE id = $1
    LIMIT 1;
   `,
   getMatchesByPlayer: `
    SELECT * FROM matches
    WHERE blue_player_id = $1 OR red_player_id = $2
    ORDER BY created_at DESC;
   `,
   finishMatch: `
    UPDATE matches 
    SET winner_id = $1, status = 'finished', ended_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *;
   `
};
