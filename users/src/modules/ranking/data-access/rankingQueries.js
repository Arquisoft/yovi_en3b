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
  `,
  getAllRankings: `
    SELECT user_id, score, total_matches, win_matches, updated_at
    FROM rankings
    ORDER BY score DESC, updated_at DESC
  `,
  getGlobalRankings: `
    SELECT
      r.user_id,
      u.username,
      u.nickname,
      u.photo as "avatarId",
      r.score,
      r.total_matches,
      r.win_matches,
      COALESCE(ROUND((r.win_matches::numeric * 100) / NULLIF(r.total_matches, 0)), 0)::int AS win_rate,
      COALESCE(last_match.winner_id = r.user_id, false) AS last_game_won,
      ROW_NUMBER() OVER (ORDER BY r.score DESC, r.updated_at DESC)::INT AS position
    FROM rankings r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN LATERAL (
      SELECT winner_id
      FROM matches m
      WHERE (m.blue_player_id = r.user_id OR m.red_player_id = r.user_id)
        AND m.status = 'finished'
      ORDER BY COALESCE(m.ended_at, m.created_at) DESC
      LIMIT 1
    ) last_match ON true
    ORDER BY r.score DESC, r.updated_at DESC
  `,
  getTotalRankingsCount: `
    SELECT COUNT(*) as total FROM rankings
  `
};
