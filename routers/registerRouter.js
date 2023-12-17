// registerRouter.js

const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

// Register route handlers
router.post('/submit-info', registerController.submitInfo);
router.post('/verify-and-register', registerController.verifyAndRegister);

module.exports = router;
