const rankingRepo = require('../data-access/rankingRepository');

const addStats = async (userId, stats) => {
  return rankingRepo.addToRanking(userId, stats);
};

const setStats = async (userId, stats) => {
  return rankingRepo.updateRanking(userId, stats);
};

const getRanking = async (userId) => {
  return rankingRepo.getRankingByUser(userId);
};

module.exports = { addStats, setStats, getRanking };
