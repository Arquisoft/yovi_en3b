const express = require('express');
const router = express.Router();
const matchController = require('./matchController');

router.post('/create', matchController.createMatch);
router.get('/user/:playerId', matchController.getPlayerMatches);

module.exports = router;