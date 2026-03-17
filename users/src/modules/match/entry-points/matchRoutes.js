const express = require('express');
const router = express.Router();
const matchController = require('./matchController');

router.post('/create', matchController.createMatch);

module.exports = router;