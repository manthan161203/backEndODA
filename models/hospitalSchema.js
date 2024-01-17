const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    hospitalId: {
        type: String,
        required: true
    },
    hospitalName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    hasAmbulance: {
        type: Boolean,
        default: false
    },
    ambulances: [{
        plateNumber: {
            type: String,
            required: true
        },
        model: {
            type: String,
            required: true
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    }],
    image: {
        type: String,
        required: false
    },
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;