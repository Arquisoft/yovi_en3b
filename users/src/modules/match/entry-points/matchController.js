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

module.exports = { createMatch };