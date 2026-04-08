const express = require('express');
const router = express.Router();
const rankingController = require('./rankingController');

router.post('/add', rankingController.add);
router.put('/update/:userId', rankingController.update);
router.get('/:userId', rankingController.get);

module.exports = router;
