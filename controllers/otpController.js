const User = require('../models/userSchema');
const crypto = require('crypto');

const generateOTP = () => {
    // Generate a random 6-letter OTP
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    return otp;
};

const addOTPToList = async (req, res) => {
    const { userId } = req.params; // Assuming userId is passed in the route parameter

    try {
        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otpCode = generateOTP();

        user.otp.push({ code: otpCode, expiryTime: new Date(Date.now() + 600000).toISOString() }); // Set expiry time to 10 minutes from now
        await user.save();

        res.status(200).json({ message: 'OTP generated and added to the list', otpCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addOTPToList,
};
