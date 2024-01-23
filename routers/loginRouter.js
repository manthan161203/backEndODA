const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/send-otp/:sendMethod/:userName', loginController.addOTPByUserName);
router.post('/verify-otp/:userName', loginController.verifyOTPByUserName);
router.post('/forgot-password-send-otp/:sendMethod/:userName', loginController.sendOTPForgotPassword);

module.exports = router;
