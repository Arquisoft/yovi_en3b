const matchRepository = require('../data-access/matchRepository');
const rankingService = require('../../ranking/domain/rankingService');

const createMatch = async (dataOrBluePlayerId, redPlayerId, isBot, botDifficulty) => {
    const data = typeof dataOrBluePlayerId === 'object' && dataOrBluePlayerId !== null
        ? dataOrBluePlayerId
        : {
            bluePlayerId: dataOrBluePlayerId,
            redPlayerId,
            isBot,
            botDifficulty,
        };

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

async function getMatchesForPlayer(playerId) {
    if (!playerId) {
        throw new Error("You must select a player ID");
    }

    const matches = await matchRepository.findMatchesByPlayerId(playerId);
    
    if (matches.length === 0) {
        return [];
    }

    return matches;
}

async function getMatchHistoryForPlayer(playerId) {
    if (!playerId) {
        throw new Error("You must select a player ID");
    }

    const matches = await matchRepository.findMatchHistoryByPlayerId(playerId);

    return matches.map((match) => {
        const playerWon = match.winner_id === playerId;
        const result = match.status !== 'finished'
            ? match.status
            : playerWon
                ? 'win'
                : 'lose';

        const opponent = match.is_bot
            ? `Bot ${getDifficultyLabel(match.bot_difficulty)}`
            : match.opponent_name || 'Unknown Player';

        return {
            id: match.id,
            date: match.created_at,
            result,
            size: match.board_size,
            opponent,
            isBot: match.is_bot,
            opponentAvatarId: match.opponent_avatar_id,
            status: match.status,
        };
    });
}

const finishMatch = async (matchId, winnerId) => {
    const match = await matchRepository.finishMatch(matchId, winnerId);

    if (!match) {
        throw new Error('Match not found');
    }

    if (winnerId !== match.blue_player_id && winnerId !== match.red_player_id) {
        throw new Error('Winner ID is not a player in this match');
    }

    const bluePlayerId = match.blue_player_id;
    const redPlayerId = match.red_player_id;
    const isBlueWinner = winnerId === bluePlayerId;
    const loser = isBlueWinner ? redPlayerId : bluePlayerId;

    await rankingService.updateOrInitializeRanking(winnerId, 1, 1);

    if (loser) {
        await rankingService.updateOrInitializeRanking(loser, 1, 0);
    }

    return match;
};

function getDifficultyLabel(botDifficulty) {
    switch (botDifficulty) {
        case 0:
            return 'Easy';
        case 1:
            return 'Medium';
        case 2:
            return 'Hard';
        default:
            return 'Unknown';
    }
}

module.exports = {
    getMatchesForPlayer,
    getMatchHistoryForPlayer,
    getMatches: getMatchesForPlayer,
    getMatchHistory: getMatchHistoryForPlayer,
    createMatch,
    finishMatch,
};
