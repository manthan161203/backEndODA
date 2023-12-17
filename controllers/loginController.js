const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendOTPviaSMS = require('../services/otpTwilio');

// Function to generate OTP
const generateOTP = () => {
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase(); // Generate a 6-letter OTP
    return otp;
};

// Function to add OTP to user's list
const addOTPToList = async (userName, otp) => {
    try {
        const user = await User.findOne({ userName });
        if (!user) {
            throw new Error('User not found');
        }
        user.otp.push({ code: otp, expiryTime: new Date(Date.now() + 600000).toISOString() });
        await user.save();
    } catch (error) {
        throw new Error('Failed to add OTP: ' + error.message);
    }
};

// Login function
const login = async (req, res) => {
    const { userName, otpCode, password, role } = req.body;

    try {
        const user = await User.findOne({ userName, role });

        // Handle user not found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify OTP
        const otpIndex = user.otp.findIndex(otp => otp.code === otpCode && new Date(otp.expiryTime) > new Date());
        if (otpIndex === -1) {
            return res.status(401).json({ message: 'Invalid OTP or OTP expired' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const secretKey = crypto.randomBytes(32).toString('hex');
        const token = jwt.sign({ userId: user._id, userName: user.userName, role: user.role }, secretKey, { expiresIn: '1h' });

        // Remove used OTP from the user's list
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
    addOTPToList,
    generateOTP
};
