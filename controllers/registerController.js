const User = require('../models/userSchema');
const crypto = require('crypto');
const sendOTPViaEmail = require('../services/otpNodeMailer');
const sendOTPViaSMS = require('../services/otpTwilio');

// Function to generate OTP
const generateOTP = () => {
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    return otp;
};

const verifyOTP = (user, otpCode) => {
    const otpIndex = user.otp.findIndex(otp => otp.code === otpCode && new Date(otp.expiryTime) > new Date());
    return otpIndex !== -1;
};

const register = {
    async register(req, res) {
        // const sendMethod = req.params.sendMethod;
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
            
            otp = generateOTP();
            await sendOTPViaSMS(phoneNumber, otp);
            const temporaryOTP = { code: otp, expiryTime: new Date(Date.now() + 600000).toISOString() };
            const isVerificationSuccessful = false;
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

            // isVerificationSuccessful = verifyOTP(newUser, otp);

            if (isVerificationSuccessful) {
                
                const savedUser = await newUser.save();
                res.status(201).json({ message: 'User registered successfully' });
            } else {
                return res.status(400).json({ error: 'Verification failed' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

module.exports = register;
