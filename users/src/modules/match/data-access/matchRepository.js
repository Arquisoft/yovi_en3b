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

const createMatch = async (matchDataOrBluePlayerId, redPlayerId, isBot, botDifficulty) => {
    const matchData = typeof matchDataOrBluePlayerId === 'object' && matchDataOrBluePlayerId !== null
        ? matchDataOrBluePlayerId
        : {
            bluePlayerId: matchDataOrBluePlayerId,
            redPlayerId,
            isBot,
            botDifficulty,
        };

    const values = [
        matchData.bluePlayerId,
        matchData.redPlayerId,
        matchData.isBot,
        matchData.botDifficulty
    ];
    
    const { rows } = await db.query(queries.createMatch, values);
    return rows[0];
};

async function getMatchById(matchId) {
    const { rows } = await db.query(queries.getMatchById, [matchId]);
    return rows[0];
}

async function getMatchesByPlayer(playerId) {
    const { rows } = await db.query(queries.getMatchesByPlayer, [playerId, playerId]);
    return rows;
}

const finishMatch = async (matchId, winnerId) => {
    const { rows } = await db.query(queries.finishMatch, [winnerId, matchId]);
    return rows[0];
};

module.exports = { findMatchesByPlayerId, findMatchHistoryByPlayerId, createMatch, getMatchById, getMatchesByPlayer, finishMatch };
