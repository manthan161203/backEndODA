const twilio = require('twilio');

const accountSid = 'ACbe2fa6e6fba7813b7de726a2041d9935';
const authToken = '7b5d8f548322dcdf2c2e9ebbd7984f1e';
const client = twilio(accountSid, authToken);

const sendOTPviaSMS = async (phoneNumber, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: '+19189922181',
            to: phoneNumber
        });
        console.log(message.sid);
        return message.sid;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to send OTP');
    }
};

module.exports = sendOTPviaSMS;
