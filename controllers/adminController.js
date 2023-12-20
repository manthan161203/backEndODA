const User = require('../models/User'); // Import your User model or relevant models

const adminController = {
    async getAllUsers(req, res) {
        try {
            const isAdmin = req.query.isAdmin === 'true'; // Assuming a query parameter for admin role check

            if (!isAdmin) {
                return res.status(403).json({ error: 'Access denied. Not an admin.' });
            }

            const users = await User.find({}, '-password'); // Exclude password from the response

            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Add other admin functionalities as needed...
};

module.exports = adminController;
