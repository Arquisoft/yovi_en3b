const matchRepository = require('../data-access/matchRepository');

const createMatch = async (data) => {
    // 1. Validaciones lógicas
    if (!data.bluePlayerId) {
        throw new Error("You need a Blue Player ID.");
    }

    if (data.isBot && (data.botDifficulty === undefined || data.botDifficulty === null)) {
        throw new Error("If you play against a BOT, you must select a difficulty.");
    }

    if (!data.isBot && !data.redPlayerId) {
        throw new Error("If you don't play against a BOT, you need a Red Player ID.");
    }

    // 2. Create and save
    const newMatch = await matchRepository.createMatch({
        bluePlayerId: data.bluePlayerId,
        redPlayerId: data.redPlayerId || null,
        isBot: data.isBot || false,
        botDifficulty: data.botDifficulty || 0
    });

    return newMatch;
};

module.exports = { createMatch };

module.exports = { createMatch };