const db = require('../../../db/db.js');

const createGameSave = async (gameSaveData) => {
    const query = `
        INSERT INTO game_saves (match_id, move_number, player_id, move_coordinates, resulting_board_state)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [
        gameSaveData.matchId,
        gameSaveData.moveNumber,
        gameSaveData.playerId,
        gameSaveData.moveCoordinates,
        gameSaveData.resultingBoardState
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
};

const getGameSavesByMatchId = async (matchId) => {
    const query = `
        SELECT * FROM game_saves 
        WHERE match_id = $1 
        ORDER BY move_number ASC
    `;
    const { rows } = await db.query(query, [matchId]);
    return rows;
};

const getGameSaveByMatchIdAndMoveNumber = async (matchId, moveNumber) => {
    const query = `
        SELECT * FROM game_saves 
        WHERE match_id = $1 AND move_number = $2
    `;
    const { rows } = await db.query(query, [matchId, moveNumber]);
    return rows[0];
};

const getLatestGameSaveByMatchId = async (matchId) => {
    const query = `
        SELECT * FROM game_saves 
        WHERE match_id = $1 
        ORDER BY move_number DESC 
        LIMIT 1
    `;
    const { rows } = await db.query(query, [matchId]);
    return rows[0];
};

module.exports = {
    createGameSave,
    getGameSavesByMatchId,
    getGameSaveByMatchIdAndMoveNumber,
    getLatestGameSaveByMatchId
};
