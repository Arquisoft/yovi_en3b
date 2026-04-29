/**
 * ============================================================================
 * FILE: matchRoutes.js
 * LAYER: Router (Entry Points)
 * DESCRIPTION: Defines the HTTP endpoints for match-related operations.
 * DEPENDENCIES: 
 * - Uses `matchController.js` to process the incoming requests.
 * CONTEXT: Mounted at the '/matches' path in the main server (`index.js`).
 * ============================================================================
 */
const express = require('express');
const router = express.Router();
const matchController = require('./matchController');

// Match endpoints
router.post('/create', matchController.createMatch);
router.post('/finish', matchController.finishMatch);
router.get('/history/:playerId', matchController.getPlayerMatchHistory);
router.get('/user/:playerId', matchController.getPlayerMatches);

// Rust Game Engine endpoint
router.post('/evaluate', matchController.evaluateBoard);

module.exports = router;
