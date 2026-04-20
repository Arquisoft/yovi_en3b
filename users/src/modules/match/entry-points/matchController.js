const matchService = require('../domain/matchService');
const axios = require('axios');

const createMatch = async (req, res) => {
    try {
        const { bluePlayerId, redPlayerId, isBot, botDifficulty } = req.body;
        const result = await matchService.createMatch(
            bluePlayerId,
            redPlayerId,
            isBot,
            botDifficulty
        );
        res.status(201).json({ 
            message: "Match created succesfully", 
            match: result 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

async function getPlayerMatches(req, res) {
    try {
        const playerId = req.params.playerId; 
        
        const matches = await matchService.getMatches(playerId);
        
        res.status(200).json(matches);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getPlayerMatchHistory(req, res) {
    try {
        const playerId = req.params.playerId;
        const matches = await matchService.getMatchHistory(playerId);
        res.status(200).json(matches);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function finishMatch(req, res) {
    try {
        const { matchId, winnerId } = req.body;
        
        if (!matchId || !winnerId) {
            return res.status(400).json({ error: "matchId and winnerId are required" });
        }
        
        const result = await matchService.finishMatch(matchId, winnerId);
        res.status(200).json({ 
            message: "Match finished successfully", 
            match: result 
        });
    } catch (error) {
        const status = /not found/i.test(error.message) ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
}

const evaluateBoard = async (req, res) => {
    try {
        const RUST_URL = process.env.BOT_SERVICE_URL || 'http://gamey:4000';
        
        const rustResponse = await axios.post(`${RUST_URL}/v1/evaluate`, req.body);

        return res.status(200).json(rustResponse.data);

    } catch (error) {
        console.error("Error connecting to Rust engine:", error.message);
        
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        return res.status(500).json({ 
            error: "Internal server error connecting to game engine" 
        });
    }
};

module.exports = {
    getPlayerMatches,
    getPlayerMatchHistory,
    getMatches: getPlayerMatches,
    getMatchHistory: getPlayerMatchHistory,
    createMatch,
    finishMatch,
    evaluateBoard,
};
