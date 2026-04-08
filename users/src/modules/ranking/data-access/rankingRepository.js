const db = require('../../../db/db.js');
const queries = require('./rankingQueries.js');

const addToRanking = async (userId, { totalMatches = 0, winMatches = 0 } = {}) => {
  const values = [userId, totalMatches, winMatches];
  const { rows } = await db.query(queries.addToRanking, values);
  return rows[0];
};

const updateRanking = async (userId, { totalMatches, winMatches } = {}) => {
  const { rows: curRows } = await db.query(queries.findRankingByUser, [userId]);
  const current = curRows[0];
  if (!current) throw new Error('Ranking not found');

  const newTotal = (totalMatches !== undefined) ? totalMatches : current.total_matches;
  const newWin = (winMatches !== undefined) ? winMatches : current.win_matches;
  const newScore = 50 * (2 * newWin - newTotal);

  const values = [newTotal, newWin, newScore, userId];

  const { rows } = await db.query(queries.updateRanking, values);
  return rows[0];
};

const getRankingByUser = async (userId) => {
  const { rows } = await db.query(queries.findRankingByUser, [userId]);
  return rows[0];
};

const getAllRankings = async () => {
  const { rows } = await db.query(queries.getAllRankings);
  return rows;
};

const getGlobalRankings = async () => {
  const { rows } = await db.query(queries.getGlobalRankings);
  return rows;
};

const getTotalRankingsCount = async () => {
  const { rows } = await db.query(queries.getTotalRankingsCount);
  return rows[0].total;
};

module.exports = { addToRanking, updateRanking, getRankingByUser, getAllRankings, getGlobalRankings, getTotalRankingsCount };
