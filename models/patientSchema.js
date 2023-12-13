const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    medicalHistory: {
        type: String
    },
    allergies: {
        type: String
    },
    role: {
        type: String,
        enum: ['patient'],
        required: true
    },
    emergencyContact: {
        name: {
            type: String
        },
        relationship: {
            type: String
        },
        phoneNumber: {
            type: String
        }
    },
    healthMetrics: {
        height: {
            type: Number
        },
        weight: {
            type: Number
        },
        bloodType: {
            type: String
        }
    },
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;