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
    const query = `
        INSERT INTO matches (blue_player_id, red_player_id, is_bot, bot_difficulty, status)
        VALUES ($1, $2, $3, $4, 'in_progress')
        RETURNING *; 
    `;
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
