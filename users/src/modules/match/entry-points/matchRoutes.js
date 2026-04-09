const express = require('express');
const router = express.Router();
const matchController = require('./matchController');

router.post('/create', matchController.createMatch);
router.post('/finish', matchController.finishMatch);
router.get('/history/:playerId', matchController.getPlayerMatchHistory);
router.get('/user/:playerId', matchController.getPlayerMatches);

module.exports = router;
