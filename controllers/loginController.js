const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendOTPviaSMS = require('../services/otpTwilio');

const secretKey = crypto.randomBytes(32).toString('hex');

// sendOTPviaSMS('+917383161203', '1234');

const login = async (req, res) => {
    const { userName, otpCode, password, role } = req.body;

    try {
        const user = await User.findOne({ userName, role });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP exists for the user
        const otpIndex = user.otp.findIndex(
            otp => otp.code === otpCode && new Date(otp.expiryTime) > new Date()
        );

        if (otpIndex === -1) {
            return res.status(401).json({ message: 'Invalid OTP or OTP expired' });
        }

        // Continue with password validation only after OTP verification succeeds
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, userName: user.userName, role: user.role },
            secretKey,
            { expiresIn: '1h' }
        );

        // Remove the used OTP from the user's OTP list
        user.otp.splice(otpIndex, 1);
        await user.save();

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    login,
};
