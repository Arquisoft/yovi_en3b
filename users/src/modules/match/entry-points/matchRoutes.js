const express = require('express');
const router = express.Router();
const matchController = require('./matchController');

router.post('/creatematch', matchController.createMatch);

module.exports = router;