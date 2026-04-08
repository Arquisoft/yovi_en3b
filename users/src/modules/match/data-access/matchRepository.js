const db = require('../../../db/db.js');
const queries = require('./matchQueries.js');

async function findMatchesByPlayerId(playerId) {
    const result = await db.query(queries.selectWherePlayerId, [playerId]);
    return result.rows;
}

async function findMatchHistoryByPlayerId(playerId) {
    const result = await db.query(queries.selectHistoryWherePlayerId, [playerId]);
    return result.rows;
}

const createMatch = async (matchData) => {
    const values = [
        matchData.bluePlayerId, 
        matchData.redPlayerId, 
        matchData.isBot, 
        matchData.botDifficulty
    ];
    
    const { rows } = await db.query(queries.createMatch, values);
    return rows[0];
};

const finishMatch = async (matchId, winnerId) => {
    const { rows } = await db.query(queries.finishMatch, [winnerId, matchId]);
    return rows[0];
};

module.exports = { findMatchesByPlayerId, findMatchHistoryByPlayerId, createMatch, finishMatch };
