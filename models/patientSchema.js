const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    medicalHistory: [{
        type: String
    }],
    allergies: [{
        type: String
    }],
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
        bloodGroup: {
            type: String
        }
    },
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;