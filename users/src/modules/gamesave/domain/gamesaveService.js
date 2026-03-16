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

    // Regex kuralımız: Sadece sayılar ve aralarında virgül olabilir
    const barycentricRegex = /^\d+,\d+,\d+$/;

    // playerLastMove gönderilmişse formatını kontrol et
    if (data.playerLastMove !== undefined && data.playerLastMove !== null) {
        if (typeof data.playerLastMove !== 'string') {
            throw new Error("Player last move must be a string.");
        }
        if (!barycentricRegex.test(data.playerLastMove)) {
            throw new Error("Invalid coordinate format. Must be Barycentric (e.g., '1,2,0').");
        }
    }

    // botLastMove gönderilmişse formatını kontrol et
    if (data.botLastMove !== undefined && data.botLastMove !== null) {
        if (typeof data.botLastMove !== 'string') {
            throw new Error("Bot last move must be a string.");
        }
        if (!barycentricRegex.test(data.botLastMove)) {
            throw new Error("Invalid coordinate format. Must be Barycentric (e.g., '1,2,0').");
        }
    }

    if (!data.resultingBoardState || typeof data.resultingBoardState !== 'string') {
        throw new Error("Board state must be a non-empty JSON string.");
    }

    // JSON formatı geçerli mi diye kontrol et
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
        playerLastMove: data.playerLastMove,
        botLastMove: data.botLastMove,
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