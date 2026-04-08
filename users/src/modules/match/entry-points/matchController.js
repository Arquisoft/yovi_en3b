const matchService = require('../domain/matchService');

const createMatch = async (req, res) => {
    try {
        const result = await matchService.createMatch(req.body);
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
        
        const matches = await matchService.getMatchesForPlayer(playerId);
        
        res.status(200).json(matches);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getPlayerMatchHistory(req, res) {
    try {
        const playerId = req.params.playerId;
        const matches = await matchService.getMatchHistoryForPlayer(playerId);
        res.status(200).json(matches);
    } catch (error) {
        res.status(400).json({ message: error.message });
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
        res.status(400).json({ error: error.message });
    }
}

module.exports = { getPlayerMatches, getPlayerMatchHistory, createMatch, finishMatch };
