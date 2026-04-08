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

const getUserRankingPosition = async (userId) => {
  const allRankings = await rankingRepo.getAllRankings();
  const totalPlayers = allRankings.length;
  
  // Find the user's position (1-indexed)
  const position = allRankings.findIndex(r => r.user_id === userId) + 1;
  
  if (position === 0) {
    // User not found in rankings
    return null;
  }
  
  return {
    position,
    totalPlayers
  };
};

const getGlobalRanking = async () => {
  return rankingRepo.getGlobalRankings();
};

const updateOrInitializeRanking = async (userId, totalMatches, winMatches) => {
  try {
    return await rankingRepo.addToRanking(userId, { totalMatches, winMatches });
  } catch (error) {
    throw new Error(`Failed to update or initialize ranking: ${error.message}`);
  }
};

module.exports = { addStats, setStats, getRanking, getUserRankingPosition, getGlobalRanking, updateOrInitializeRanking };
