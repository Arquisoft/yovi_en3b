const db = require('../../../db/db.js');

const createMatch = async (matchData) => {
    const query = `
        INSERT INTO matches (blue_player_id, red_player_id, is_bot, bot_difficulty, status, current_state)
        VALUES ($1, $2, $3, $4, 'in_progress', $5)
        RETURNING *; 
    `;
    const values = [
        matchData.bluePlayerId, 
        matchData.redPlayerId, 
        matchData.isBot, 
        matchData.botDifficulty,
        matchData.currentState || null
    ];
    
    const { rows } = await db.query(query, values);
    return rows[0];
};

module.exports = { createMatch };