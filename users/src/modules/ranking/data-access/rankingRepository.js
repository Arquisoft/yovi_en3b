const db = require('../../../db/db.js');

const addToRanking = async (userId, { totalMatches = 0, winMatches = 0 } = {}) => {
  const query = `
    INSERT INTO rankings (user_id, total_matches, win_matches, score)
    VALUES ($1, $2, $3, 50 * (2 * $3 - $2))
    ON CONFLICT (user_id) DO UPDATE SET
      total_matches = rankings.total_matches + EXCLUDED.total_matches,
      win_matches = rankings.win_matches + EXCLUDED.win_matches,
      score = 50 * (2 * (rankings.win_matches + EXCLUDED.win_matches) - (rankings.total_matches + EXCLUDED.total_matches)),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [userId, totalMatches, winMatches];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const updateRanking = async (userId, { totalMatches, winMatches } = {}) => {
  const currentQ = 'SELECT * FROM rankings WHERE user_id = $1';
  const { rows: curRows } = await db.query(currentQ, [userId]);
  const current = curRows[0];
  if (!current) throw new Error('Ranking not found');

  const newTotal = (totalMatches !== undefined) ? totalMatches : current.total_matches;
  const newWin = (winMatches !== undefined) ? winMatches : current.win_matches;
  const newScore = 50 * (2 * newWin - newTotal);

  const query = `UPDATE rankings SET total_matches = $1, win_matches = $2, score = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4 RETURNING *`;
  const values = [newTotal, newWin, newScore, userId];

  const { rows } = await db.query(query, values);
  return rows[0];
};

const getRankingByUser = async (userId) => {
  const query = 'SELECT * FROM rankings WHERE user_id = $1';
  const { rows } = await db.query(query, [userId]);
  return rows[0];
};

module.exports = { addToRanking, updateRanking, getRankingByUser };
