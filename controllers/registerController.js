const User = require('../models/userSchema');
const crypto = require('crypto');
const sendOTPViaSMS = require('../services/otpTwilio');

// Function to generate OTP
const generateOTP = () => {
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    return otp;
};

const verifyOTP = (user, otpCode) => {
    const otpIndex = user.otpList.findIndex(otp => otp.code === otpCode && new Date(otp.expiryTime) > new Date());
    return otpIndex !== -1;
};

const register = {
    async submitInfo(req, res) {
        try {
            const {
                userId,
                firstName,
                lastName,
                email,
                userName,
                password,
                dateOfBirth,
                phoneNumber,
                address,
                gender,
                role,
            } = req.body;

            const existingEmailUser = await User.findOne({ email });
            if (existingEmailUser) {
                return res.status(400).json({ error: 'User already exists with the provided email' });
            }

            const existingUsernameUser = await User.findOne({ userName });
            if (existingUsernameUser) {
                return res.status(400).json({ error: 'User already exists with the provided username' });
            }

            const existingPhoneNumberUser = await User.findOne({ phoneNumber });
            if (existingPhoneNumberUser) {
                return res.status(400).json({ error: 'User already exists with the provided phone number' });
            }
            const otp = generateOTP();
            await sendOTPViaSMS(phoneNumber, otp);
            const temporaryOTP = { code: otp, expiryTime: new Date(Date.now() + 600000).toISOString() };
            const newUser = new User({
                userId,
                firstName,
                lastName,
                email,
                userName,
                password,
                dateOfBirth,
                phoneNumber,
                address,
                gender,
                role,
                otp: [temporaryOTP]
            });
            
            const savedUser = await newUser.save();
            res.status(201).json({ message: 'User information submitted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async verifyAndRegister(req, res) {
        try {
            const { phoneNumber, otpCode } = req.body;
            const user = await User.findOne({ phoneNumber });

            if (!user) {
                return res.status(404).json({ error: 'User not found with the provided phone number' });
            }

            const isOTPVerified = verifyOTP(user, otpCode);

            if (!isOTPVerified) {
                await User.deleteOne({ phoneNumber });
                return res.status(401).json({ error: 'Invalid OTP or OTP expired' });
            }

            // Save the user to the database now that the OTP is verified
            // await user.save();

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

module.exports = register;
