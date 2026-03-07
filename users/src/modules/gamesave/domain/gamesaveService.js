const gamesaveRepository = require('../data-access/gamesaveRepository');

const validateGameSaveData = (data) => {
    if (!data.matchId) {
        throw new Error("Match ID is required.");
    }

    if (data.moveNumber === undefined || data.moveNumber === null) {
        throw new Error("Move number is required.");
    }

    if (!Number.isInteger(data.moveNumber) || data.moveNumber < 1) {
        throw new Error("Move number must be a positive integer.");
    }

    if (!data.playerId) {
        throw new Error("Player ID is required.");
    }

    if (!data.moveCoordinates || typeof data.moveCoordinates !== 'string') {
        throw new Error("Move coordinates must be a non-empty string.");
    }

    if (!data.resultingBoardState || typeof data.resultingBoardState !== 'string') {
        throw new Error("Board state must be a non-empty JSON string.");
    }

    // Try to parse JSON to validate it's valid
    try {
        JSON.parse(data.resultingBoardState);
    } catch (e) {
        throw new Error("Board state must be valid JSON.");
    }
};

const saveMove = async (data) => {
    validateGameSaveData(data);

    const newGameSave = await gamesaveRepository.createGameSave({
        matchId: data.matchId,
        moveNumber: data.moveNumber,
        playerId: data.playerId,
        moveCoordinates: data.moveCoordinates,
        resultingBoardState: data.resultingBoardState
    });

    return newGameSave;
};

const loadMatchMoves = async (matchId) => {
    if (!matchId) {
        throw new Error("Match ID is required.");
    }

    const moves = await gamesaveRepository.getGameSavesByMatchId(matchId);
    return moves;
};

const loadMove = async (matchId, moveNumber) => {
    if (!matchId) {
        throw new Error("Match ID is required.");
    }

    if (moveNumber === undefined || moveNumber === null) {
        throw new Error("Move number is required.");
    }

    if (!Number.isInteger(moveNumber) || moveNumber < 1) {
        throw new Error("Move number must be a positive integer.");
    }

    const move = await gamesaveRepository.getGameSaveByMatchIdAndMoveNumber(matchId, moveNumber);
    
    if (!move) {
        throw new Error("Move not found.");
    }

    return move;
};

const loadLatestMove = async (matchId) => {
    if (!matchId) {
        throw new Error("Match ID is required.");
    }

    const move = await gamesaveRepository.getLatestGameSaveByMatchId(matchId);
    
    if (!move) {
        throw new Error("No moves found for this match.");
    }

    return move;
};

module.exports = {
    saveMove,
    loadMatchMoves,
    loadMove,
    loadLatestMove
};
