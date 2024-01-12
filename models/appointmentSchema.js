const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    appointmentId: {
        unique: true,
        type: String,
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    }, 
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UnifiedDoctor',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    slot: {
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    prerequisite: {
        type: String
    },
    recommendedDoctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UnifiedDoctor'
    }],
    notes: {
        type: String
    }

}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;