const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Login route
router.post('/', loginController.login);

// Add OTP by userId route handler
router.post('/add-otp-by-id/sms/:userId', loginController.addOTPByUserId);
router.post('/add-otp-by-id/email/:userId', loginController.addOTPByUserId);

// Add OTP by userName route handler
router.post('/add-otp-by-username/sms/:userName', loginController.addOTPByUserName);
router.post('/add-otp-by-username/email/:userName', loginController.addOTPByUserName);

module.exports = router;
