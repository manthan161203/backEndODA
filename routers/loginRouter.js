const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/send-otp/:sendMethod/:userName', loginController.addOTPByUserName);
router.post('/verify-otp/:userName', loginController.verifyOTPByUserName);

module.exports = router;
