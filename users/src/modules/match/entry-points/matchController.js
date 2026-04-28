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
        
        if (!matchId) {
            return res.status(400).json({ error: "matchId and winnerId are required" });
        }

        if (!winnerId) {
            return res.status(400).json({ error: "winnerId is required" });
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
        /*
        const { URL } = require('node:url');

        const ALLOWED_HOSTS = ['gamey', 'localhost', '20.199.16.53'];

        const rawUrl = process.env.BOT_SERVICE_URL ?? 'http://gamey:4000';
        const parsedUrl = new URL(rawUrl);

        if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
            return res.status(500).json({ error: 'Invalid configuration' });
        }

        const rustResponse = await axios.post(
            `${parsedUrl.origin}/v1/evaluate`,
            req.body
        );
        */
       // Validar estructura del payload (previene inyección desde datos de usuario)
        const allowedKeys = ['size', 'turn', 'players', 'layout'];
        const sanitizedPayload = {};
        for (const key of allowedKeys) {
            if (req.body[key] !== undefined) {
                sanitizedPayload[key] = req.body[key];
            }
        }

        const rustResponse = await axios.post(
            `http://gamey:4000/v1/evaluate`,
            sanitizedPayload
        );

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
