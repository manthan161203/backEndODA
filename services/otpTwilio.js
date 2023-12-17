const twilio = require('twilio');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.ACCOUNT_TOKEN;
const client = twilio(accountSid, authToken);

const sendOTPViaSMS = async (phoneNumber, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: process.env.TO_PHONE_NUMBER,
            to: phoneNumber
        });
        console.log(message.sid);
        return message.sid;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to send OTP');
    }
};

module.exports = sendOTPViaSMS;
