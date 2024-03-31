const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendOTPViaSMS = require('../services/otpTwilio');
const sendOTPViaEmail = require('../services/otpNodeMailer');
// Function to generate OTP
const generateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    return otp;
};

// Function to generate a secure secret key
const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Function to add OTP to user's list
const addOTPToList = async (user, otp) => {
    try {
        user.otp.push({ code: otp, expiryTime: new Date(Date.now() + 600000).toISOString() });
        await user.save();
    } catch (error) {
        throw new Error('Failed to add OTP: ' + error.message);
    }
};

const sendOTPForgotPassword = async (req, res) => {
    const userName = req.params.userName;
    const sendMethod = req.params.sendMethod;
    try {
        const otp = generateOTP();
        
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // const isPasswordValid = await bcrypt.compare(enteredPassword, user.password);
        
        // if (!isPasswordValid) {
        //     return res.status(401).json({ success: false, message: 'Invalid password' });
        // }
        
        await addOTPToList(user, otp);

        if (sendMethod === 'sms') {
            const phoneNumber = user.phoneNumber;
            await sendOTPViaSMS(phoneNumber, otp);
        } else if (sendMethod === 'email') {
            const email = user.email;
            const htmlTemplate = ``;
            await sendOTPViaEmail(email, "Verification Code", "Your verification code is: " + otp);
        } else {
            throw new Error('Invalid send method');
        }

        res.status(200).json({ success: true, message: `OTP added to the user's list and sent via ${sendMethod.toUpperCase()} successfully` });
    } catch (error) {
        console.error('Error during OTP sending:', error);
        res.status(500).json({ success: false, message: 'Failed to add OTP or send via SMS/Email', error: error.message });
    }
}

// Add OTP by userName route handler
const addOTPByUserName = async (req, res) => {
    const userName = req.params.userName;
    const sendMethod = req.params.sendMethod; // 'sms' or 'email'
    const enteredPassword = req.body.password;

    try {
        const otp = generateOTP();
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const isPasswordValid = await bcrypt.compare(enteredPassword, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }
        
        await addOTPToList(user, otp);

        if (sendMethod === 'sms') {
            const phoneNumber = user.phoneNumber;
            await sendOTPViaSMS(phoneNumber, otp);
        } else if (sendMethod === 'email') {
            const email = user.email;
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
                                        <h2 style="margin-top: 0; color: #333333;">Login OTP</h2>
                                        <!-- Replace placeholders with dynamic data -->
                                        <p style="margin-bottom: 20px; color: #666666;">Dear ${user.firstName+ " "+user.lastName},</p>
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

        res.status(200).json({ success: true, message: `OTP added to the user's list and sent via ${sendMethod.toUpperCase()} successfully` });
    } catch (error) {
        console.error('Error during OTP sending:', error);
        res.status(500).json({ success: false, message: 'Failed to add OTP or send via SMS/Email', error: error.message });
    }
};
const verifyOTPByUserName = async (req, res) => {
    const userName = req.params.userName;
    const enteredOTP = req.body.otp;
    try {
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otpIndex = user.otp.findIndex(otp => otp.code === enteredOTP && new Date(otp.expiryTime) > new Date());
        if (otpIndex === -1) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }
        const secretKey = generateSecretKey();
        const token = jwt.sign({userName: user.userName }, secretKey, { expiresIn: '1h' });
        console.log("Token " + token);
        user.otp.splice(otpIndex, 1);
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addOTPByUserName,
    verifyOTPByUserName,
    sendOTPForgotPassword
};
