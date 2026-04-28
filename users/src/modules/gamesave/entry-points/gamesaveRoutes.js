const express = require('express');
const router = express.Router();
const gamesaveController = require('./gamesaveController');

// POST /gamesaves/save - Save a new move
router.post('/save', gamesaveController.saveMove);

// GET /gamesaves/:matchId - Get all moves for a match
router.get('/:matchId', gamesaveController.getMatchMoves);

// GET /gamesaves/:matchId/moves/:moveNumber - Get a specific move
router.get('/:matchId/moves/:moveNumber', gamesaveController.getMove);

// GET /gamesaves/:matchId/latest - Get the latest move of a match
router.get('/:matchId/latest', gamesaveController.getLatestMove);

module.exports = router;
