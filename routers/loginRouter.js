const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Add OTP by userName route handler
router.post('/send-otp/:sendMethod/:userName', loginController.addOTPByUserName);

// Verify OTP route handler
router.post('/verify-otp/:userName', loginController.verifyOTPByUserName);

module.exports = router;
