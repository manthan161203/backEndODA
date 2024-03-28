const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/getUserDetails/:userName', userController.getUserDetails);
router.put('/updateUserDetails/:userName', userController.updateUserDetails);
router.get('/getAllUsers', userController.getAllUsers);

module.exports = router;