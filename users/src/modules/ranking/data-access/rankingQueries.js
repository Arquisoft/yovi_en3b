// File to write the queries required for the ranking management
module.exports = {
  addToRanking: `
    INSERT INTO rankings (user_id, total_matches, win_matches, score)
    VALUES ($1, $2, $3, 50 * (2 * $3 - $2))
    ON CONFLICT (user_id) DO UPDATE SET
      total_matches = rankings.total_matches + EXCLUDED.total_matches,
      win_matches = rankings.win_matches + EXCLUDED.win_matches,
      score = 50 * (2 * (rankings.win_matches + EXCLUDED.win_matches) - (rankings.total_matches + EXCLUDED.total_matches)),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `,
  findRankingByUser: `
    SELECT * FROM rankings WHERE user_id = $1
  `,
  updateRanking: `
    UPDATE rankings SET total_matches = $1, win_matches = $2, score = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4 RETURNING *
  `
};