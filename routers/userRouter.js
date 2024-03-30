const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/getUserDetails/:userName', userController.getUserDetails);
router.put('/updateUserDetails/:userName', userController.updateUserDetails);
router.get('/getAllUsers', userController.getAllUsers);
router.post('/checkEmail', userController.checkEmail);
router.post('/checkPhoneNumber', userController.checkPhoneNumber);
router.post('/checkUsername', userController.checkUsername);

module.exports = router;