const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');

// Route to get all users (admin-only functionality)
adminRouter.get('/users', adminController.getAllUsers);

// Other admin routes using adminController functions...
// Example: adminRouter.post('/createUser', adminController.createUser);

module.exports = adminRouter;
