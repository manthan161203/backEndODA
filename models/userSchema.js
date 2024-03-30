const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // userId: {
    //     type: String,
    //     unique: true,
    //     require: true
    // },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'clinical doctor', 'therapist', 'admin', 'superAdmin'],
        required: true
    },
    isSubProfileSet: {
        type: Boolean,
        default: false
    },
    otp: [{
        code: {
            type: String
            
        },
        expiryTime: {
            type: String,
        }
    }],
    invalidOTPAttempts: {
        type: String,
        default: "0"
    },
    image: {
        type: String,
        required: false
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

