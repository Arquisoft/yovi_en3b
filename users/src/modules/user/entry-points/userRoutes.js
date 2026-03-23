const express = require('express');
const router = express.Router();
const userController = require('./userController');

//Intermediate step to redirect the request, just for ordering code
router.post('/createuser', userController.createUser);
router.get('/findUserByUsername', userController.findUserByUsername);
router.post('/loginUser', userController.loginUser);
router.post('/changePassword', userController.changePassword);
router.post('/changeNickname', userController.changeNickname);

module.exports = router;