const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

router.post('/submit-info/:sendMethod', registerController.submitInfo);
router.post('/verify-and-register', registerController.verifyAndRegister);

module.exports = router;
