const gamesaveService = require('../domain/gamesaveService');

const saveMove = async (req, res) => {
    try {
        const result = await gamesaveService.saveMove(req.body);
        res.status(201).json({
            message: "Game save created successfully",
            gameSave: result
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getMatchMoves = async (req, res) => {
    try {
        const { matchId } = req.params;
        const moves = await gamesaveService.loadMatchMoves(matchId);
        res.status(200).json({
            message: "Moves retrieved successfully",
            moves: moves
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getMove = async (req, res) => {
    try {
        const { matchId, moveNumber } = req.params;
        const move = await gamesaveService.loadMove(matchId, parseInt(moveNumber));
        res.status(200).json({
            message: "Move retrieved successfully",
            move: move
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getLatestMove = async (req, res) => {
    try {
        const { matchId } = req.params;
        const move = await gamesaveService.loadLatestMove(matchId);
        res.status(200).json({
            message: "Latest move retrieved successfully",
            move: move
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    saveMove,
    getMatchMoves,
    getMove,
    getLatestMove
};
