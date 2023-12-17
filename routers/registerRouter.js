const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

// Register route
router.post('/', registerController.register);

module.exports = router;
