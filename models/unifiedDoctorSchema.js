const mongoose = require('mongoose')
const User = require('./userSchema')

const unifiedDoctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        doctorSpecialization: {
            type: String,
            required: true
        },
        doctorType: {
            type: String,
            enum: ['doctor', 'clinical doctor', 'therapist'],
            required: true
        },
        hospitalID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
            required: function () {
                return this.doctorType === 'doctor'
            }
        },
        clinicAddress: {
            type: String,
            required: function () {
                return this.doctorType === 'clinical doctor'
            }
        },
        therapistLocation: {
            type: String,
            required: function () {
                return this.doctorType === 'therapist'
            }
        },
        appointmentTimeSlots: [
            {
                day: {
                    type: String,
                    required: true
                },
                availableTimeSlots: [
                    {
                        startTime: {
                            type: Date,
                            required: true
                        },
                        endTime: {
                            type: Date,
                            required: true
                        }
                    }
                ]
            }
        ],
        assignedDepartments: [
            {
                type: String
            }
        ]
    },
    { timestamps: true }
)

const UnifiedDoctor = mongoose.model('UnifiedDoctor', unifiedDoctorSchema)

module.exports = UnifiedDoctor
