const db = require('../../../db/db.js');
const queries = require('./matchQueries.js');

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

module.exports = { createMatch };
