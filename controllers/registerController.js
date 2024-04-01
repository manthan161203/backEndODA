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
                const email = req.body.email;
                const htmlTemplate = `<!DOCTYPE html>
                <html lang="en">
                
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Login OTP</title>
                </head>
                
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                        style="margin-top: 50px;">
                        <tr>
                            <td>
                                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                                    style="margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <tr>
                                        <td style="padding: 40px;">
                                            <h2 style="margin-top: 0; color: #333333;">Register OTP</h2>
                                            <!-- Replace placeholders with dynamic data -->
                                            <p style="margin-bottom: 20px; color: #666666;">Dear ${req.body.firstName + " " + req.body.lastName},</p>
                                            <p style="margin-bottom: 20px; color: #666666;">Your OTP for login is:</p>
                                            <h3 style="margin-bottom: 20px; color: #333333;">${otp}</h3>
                                            <p style="margin-bottom: 20px; color: #666666;">Please use this OTP to login to your account.</p>
                                            <p style="margin-bottom: 20px; color: #666666;">This OTP is valid for a single login attempt and should not be shared with anyone.</p>
                                            <!-- Image for additional information -->
                                            <img src="http://easy-health-care.infinityfreeapp.com/otp.png" alt="Additional Information" style="max-width: 100%; display: block; margin: 20px auto;">
                                            <p style="margin-bottom: 0; color: #666666;">Best regards,<br>YourAppName Team</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                        <td style="padding: 20px 0; text-align: center; font-size: 12px; color: #666666;">
                        &copy; 2024 MTM Brothers. All rights reserved.
                    </td>
                        </tr>
                    </table>
                </body>
                
                </html>
                `;
                await sendOTPViaEmail(email, "Verification Code", "please dont share otp", htmlTemplate);
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
                image: '',
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
            // if(user.role == "patient"){
            //     const patient = new Patient({
            //         user: user._id,
            //         medicalHistory: " ",
            //         allergies: " ",
            //         emergencyContact: {
            //             name: " ",
            //             relationship: " ",
            //             phoneNumber: " ",
            //         },
            //         healthMetrics: {
            //             height: " ",
            //             weight: " ",
            //             bloodGroup: " ",
            //         }
            //     })
            //     patient.save();
            // }
            // else if(user.role == "clinical doctor" || user.role == "doctor" || user.role == "therapist"){
            //     const doctor = new UnifiedDoctor({
            //         user: user._id,
            //         doctorSpecialization: " ",
            //         doctorDegree: " ",
            //         doctorBio: " ",
            //         fee: " ",
            //     })
            //     if(user.role == "therapist"){

            //         doctor.doctorType =  "therapist",
            //         doctor.therapistAddress = " ";
            //     }else{
            //         doctor.doctorType =  "clinical doctor",
            //         doctor.clinicAddress = " ";
            //     }
            //     doctor.save();
            // }  
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = register;