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
    updateUserDetails: async (req, res) => {
        try {
            const { userName } = req.params;
            const updatedData = req.body;
            updatedData.password = await bcrypt.hash(
                updatedData.password,
                saltRounds
            );
            const updatedUser = await User.findOneAndUpdate(
                { userName: userName },
                { $set: updatedData },
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
};

module.exports = userController;
