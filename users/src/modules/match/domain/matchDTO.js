const toMatchResponseDto = (match) => {
    return {
      id: match.id,
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