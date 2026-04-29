/**
 * ============================================================================
 * FILE: matchDTO.js
 * LAYER: Data Transfer Object (DTO)
 * DESCRIPTION: Formats the data objects that enter and exit the backend.
 * Ensures the Frontend receives consistent structures without
 * exposing sensitive database fields.
 * ============================================================================
 */
const toMatchResponseDto = (match) => {
    return {
      bluePlayerId: match.bluePlayerId,
      redPlayerId: match.redPlayerId,
      isBot: match.isBot,
      botDifficulty: match.botDifficulty,
      status: match.status,
      winner_id: match.winner_id,
      ended_at: match.ended_at
    };
  };
  
const toMatchInputDto = (match) => {
    return {
        bluePlayerId: match.bluePlayerId,
        redPlayerId: match.redPlayerId,
        isBot: match.isBot,
        botDifficulty: match.botDifficulty,
        status: match.status,
        winner_id: match.winner_id,
        ended_at: match.ended_at
    };
};

module.exports = { 
    toMatchResponseDto,
    toMatchInputDto 
};