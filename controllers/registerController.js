const User = require('../models/userSchema');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const sendOTPViaSMS = require('../services/otpTwilio');
const sendOTPViaEmail = require('../services/otpNodeMailer');
const Patient = require('../models/patientSchema');
const UnifiedDoctor = require('../models/unifiedDoctorSchema');

const saltRounds = 10;

// Function to generate OTP
const generateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    return otp;
};

const verifyOTP = (user, otpCode) => {
    const otpIndex = user.otp.findIndex(otp => otp.code === otpCode && new Date(otp.expiryTime) > new Date());
    return otpIndex !== -1;
};

const register = {
    async submitInfo(req, res) {
        const { sendMethod } = req.params;
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
            // await sendOTPViaSMS(phoneNumber, otp);
            // await sendOTPViaEmail(email, 'Verification Code', `Your verification code is: ${otp}`);
            if (sendMethod === 'sms') {
                await sendOTPViaSMS(phoneNumber, otp);
            } else if (sendMethod === 'email') {
                await sendOTPViaEmail(email, "Verification Code", "Your verification code is: " + otp);
            } else {
                throw new Error('Invalid send method');
            }
            const temporaryOTP = { code: otp, expiryTime: new Date(Date.now() + 600000).toISOString() };

            // Hash the password before saving it
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = new User({
                userId,
                firstName,
                lastName,
                email,
                userName,
                password: hashedPassword,
                dateOfBirth,
                phoneNumber,
                address,
                gender,
                role,
                otp: [temporaryOTP]
            });

            await newUser.save();
            res.status(201).json({ message: 'User information submitted successfully' });
        } catch (error) {
            console.error(error);
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

            user.invalidOTPAttempts = user.invalidOTPAttempts || 0;
            
            const isOTPVerified = verifyOTP(user, otpCode);
    
            if (!isOTPVerified) {
                user.invalidOTPAttempts++;
    
                if (user.invalidOTPAttempts > 3) {
                    await User.deleteOne({ phoneNumber });
                    return res.status(401).json({ error: 'Too many invalid OTP attempts, user deleted' });
                }

                // update OTP attempts
                await user.save();
    
                return res.status(401).json({ error: 'Invalid OTP or OTP expired' });
            }

            user.invalidOTPAttempts = 0;
            
            await user.save();
            if(user.role == "patient"){
                const patient = new Patient({
                    user: user._id,
                    medicalHistory: " ",
                    allergies: " ",
                    emergencyContact: {
                        name: " ",
                        relationship: " ",
                        phoneNumber: " ",
                    },
                    healthMetrics: {
                        height: " ",
                        weight: " ",
                        bloodGroup: " ",
                    }
                })
                patient.save();
            }
            else if(user.role == "clinical doctor" || user.role == "doctor" || user.role == "therapist"){
                const doctor = new UnifiedDoctor({
                    user: user._id,
                    doctorSpecialization: " ",
                    doctorDegree: " ",
                    doctorBio: " ",
                    fee: " ",
                })
                if(user.role == "therapist"){
                    
                    doctor.doctorType =  "therapist",
                    doctor.therapistAddress = " ";
                }else{
                    doctor.doctorType =  "clinical doctor",
                    doctor.clinicAddress = " ";
                }
                doctor.save();
            }  
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = register;