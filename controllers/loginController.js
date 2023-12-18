const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendOTPViaSMS = require('../services/otpTwilio');
const sendOTPViaEmail = require('../services/otpNodeMailer');

// Function to generate OTP
const generateOTP = () => {
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase(); // Generate a 6-letter OTP
    return otp;
};

// Function to generate a secure secret key
const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Function to add OTP to user's list
const addOTPToList = async (userName, otp) => {
    try {
        const user = await User.findOne({userName});
        if (!user) {
            throw new Error('User not found');
        }
        user.otp.push({ code: otp, expiryTime: new Date(Date.now() + 600000).toISOString() });
        await user.save();
    } catch (error) {
        throw new Error('Failed to add OTP: ' + error.message);
    }
};

// Add OTP by userName route handler
const addOTPByUserName = async (req, res) => {
    const userName = req.params.userName;
    const sendMethod = req.params.sendMethod; // 'sms' or 'email'

    try {
        const otp = generateOTP();
        await addOTPToList(userName, otp);

        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (sendMethod === 'sms') {
            const phoneNumber = user.phoneNumber;
            await sendOTPViaSMS(phoneNumber, otp);
        } else if (sendMethod === 'email') {
            const email = user.email;
            await sendOTPViaEmail(email, "Verification Code", "Your verification code is: " + otp);
        } else {
            throw new Error('Invalid send method');
        }

        res.status(200).json({ message: `OTP added to the user's list and sent Via ${sendMethod.toUpperCase()} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add OTP or send Via SMS/Email' });
    }
};

// Verify OTP and Password by userName route handler
const verifyOTPByUserName = async (req, res) => {
    const userName = req.params.userName;
    const enteredOTP = req.body.otp;
    const enteredPassword = req.body.password;

    try {
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otpIndex = user.otp.findIndex(otp => otp.code === enteredOTP && new Date(otp.expiryTime) > new Date());
        if (otpIndex === -1) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }

        // Verify Password
        // const isPasswordValid = await bcrypt.compare(enteredPassword, user.password);
        if (enteredPassword == user.password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // // JWT Token
        // const secretKey = generateSecretKey();
        // console.log(yourSecretKey);
        // const token = jwt.sign({userName: user.userName }, secretKey, { expiresIn: '1h' });
        // console.log("Token " + token);

        user.otp.splice(otpIndex, 1);
        await user.save();

        res.status(200).json({ message: 'OTP and password verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addOTPByUserName,
    verifyOTPByUserName
};
