const User = require('../models/userSchema');
const sendOTPViaEmail = require('../services/otpNodeMailer');
const sendOTPViaSMS = require('../services/otpTwilio');

// Function to generate OTP
const generateOTP = () => {
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    return otp;
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

            otp = generateOTP();
            await sendOTPViaEmail(email, "Verification Code", "Your verification code is: " + otp);
            otp = generateOTP();
            await sendOTPViaSMS(phoneNumber, otp);
            const temporaryOTP = { code: otp, expiryTime: new Date(Date.now() + 600000).toISOString() };
            const isVerificationSuccessful = true;

            if (isVerificationSuccessful) {
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
