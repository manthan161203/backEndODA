const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const User = require('../models/userSchema'); 

router.post('/', loginController.login);

router.post('/add-otp/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = loginController.generateOTP();
        console.log(otp);
        
        // Add OTP to the user's list
        await loginController.addOTPToList(userId, otp);

        // Send OTP via SMS using Twilio
        const phoneNumber = user.phoneNumber; // Assuming phoneNumber is stored in the user object
        await sendOTPviaSMS(phoneNumber, otp);

        res.status(200).json({ message: 'OTP added to the user\'s list and sent via SMS successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add OTP to the user\'s list or send via SMS' });
    }
});


router.post('/add-otp/:userName', async (req, res) => {
    const userName = req.params.userName;
    
    try {
        const user = await User.findOne({ userName }); // Use the 'userName' field for the query
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = loginController.generateOTP();
        
        // Add OTP to the user's list using userName
        await loginController.addOTPToList(userName, otp);

        // Send OTP via SMS using Twilio
        const phoneNumber = user.phoneNumber; // Assuming phoneNumber is stored in the user object
        await sendOTPviaSMS(phoneNumber, otp); // Send OTP via SMS using Twilio
        
        res.status(200).json({ message: 'OTP added to the user\'s list and sent via SMS successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add OTP to the user\'s list or send via SMS' });
    }
});



module.exports = router;
