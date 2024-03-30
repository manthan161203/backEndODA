const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userController = {
    getUserDetails: async (req, res) => {
        try {
            const { userName } = req.params;
            const userData = await User.findOne({ userName: userName });
            res.status(200).json(userData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const user = await User.find();
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    updateUserDetails: async (req, res) => {
        try {
            const { userName } = req.params;
    
            // Update the user details
            const updatedUser = await User.findOneAndUpdate(
                { userName: userName },
                { $set: req.body }, // Update all fields in req.body
                { new: true }
            );
    
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
    
            return res.status(200).json(updatedUser);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
    checkEmail: async (req, res) => {
        try {
            const { email } = req.body;
            const existingUser = await User.findOne({ email });
            res.status(200).json({ exists: !!existingUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    checkPhoneNumber: async (req, res) => {
        try {
            const { phoneNumber } = req.body;
            const existingUser = await User.findOne({ phoneNumber });
            res.status(200).json({ exists: !!existingUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }   
};

module.exports = userController;
