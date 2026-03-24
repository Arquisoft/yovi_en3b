const db = require('../../../db/db.js');
const queries = require('./gamesaveQueries.js');

const createGameSave = async (gameSaveData) => {
    const values = [
        gameSaveData.matchId,
        gameSaveData.moveNumber,
        gameSaveData.playerId,
        gameSaveData.moveCoordinates,
        gameSaveData.resultingBoardState
    ];

    const { rows } = await db.query(queries.createGameSave, values);
    return rows[0];
};

const getGameSavesByMatchId = async (matchId) => {
    const { rows } = await db.query(queries.findGameSavesByMatch, [matchId]);
    return rows;
};

const getGameSaveByMatchIdAndMoveNumber = async (matchId, moveNumber) => {
    const { rows } = await db.query(queries.findGameSavesByMatchAndMove, [matchId, moveNumber]);
    return rows[0];
};

const getLatestGameSaveByMatchId = async (matchId) => {
    const { rows } = await db.query(queries.findLastGameSaveByMatch, [matchId]);
    return rows[0];
};

module.exports = {
    createGameSave,
    getGameSavesByMatchId,
    getGameSaveByMatchIdAndMoveNumber,
    getLatestGameSaveByMatchId
};
