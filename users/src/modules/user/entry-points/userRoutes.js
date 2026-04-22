const express = require('express');
const router = express.Router();
const userController = require('./userController');
const authutils = require('../../../auth/authUtils');

//Intermediate step to redirect the request, just for ordering code
router.post('/createuser', userController.createUser);
router.get('/findUserByUsername', userController.findUserByUsername);
router.post('/loginUser', userController.loginUser);
router.post('/changePassword', authutils.verifyToken, userController.changePassword);
router.post('/changeNicknameAndPhoto', authutils.verifyToken, userController.changeNicknameAndPhoto);

module.exports = router;
