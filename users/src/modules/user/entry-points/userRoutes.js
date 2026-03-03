const express = require('express');
const router = express.Router();
const userController = require('./userController');

//Intermediate step to redirect the request, just for ordering code
router.post('/createuser', userController.createUser);

module.exports = router;