const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/', loginController.login);
router.post('/add-otp-by-id/:userId', loginController.addOTPByUserId);
router.post('/add-otp-by-username/:userName', loginController.addOTPByUserName);

module.exports = router;
