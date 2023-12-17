const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Login route
router.post('/', loginController.login);

// Add OTP by userId route handler
router.post('/add-otp-by-id/:sendMethod/:userId', loginController.addOTPByUserId);

// Add OTP by userName route handler
router.post('/add-otp-by-username/:sendMethod/:userName', loginController.addOTPByUserName);

module.exports = router;
