const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
        type: Date,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
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
        enum: ['patient', 'doctor', 'therapist', 'admin', 'superAdmin'],
        required: true
    },
    otp: [{
        code: {
            type: String
            
        },
        expiryTime: {
            type: Date,
            default: Date.now() + 5 * 60 * 1000,
        }
    }],
    image: {
        type: String,
        required: false
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;