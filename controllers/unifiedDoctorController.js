const { response } = require('express');
const Appointments = require('../models/appointmentSchema');
const Patient = require('../models/patientSchema');
const UnifiedDoctor = require('../models/unifiedDoctorSchema');

const unifiedDoctorController = {
    getAppointmentsByDoctorID: async (req, res) => {
        try {
            const { doctorID } = req.params;
            // console.log(doctorID);
            const appointments = await Appointments.find({'doctor': doctorID}).populate({path: 'patient', populate: 'user'}).exec();
            // console.log(appointments);
            res.status(200).json(appointments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Update Appointment Status
    updateAppointmentStatus: async (req, res) => {
        try {
            const { appointmentID } = req.params;
            const data = req.body;
            const updatedAppointment = await Appointments.findOneAndUpdate(
                { appointmentId: appointmentID },
                { $set: data },
                { new: true }
            );
            // res.status(200).json({ message: 'Appointment status updated successfully' });
            res.status(200).json(updatedAppointment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get Patient Info
    getPatientInfo: async (req, res) => {
        try {
            const { patientID } = req.params;
            // console.log(patientID);
            const patientData = await Patient.findById( patientID ).populate('user');
            res.status(200).json(patientData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get Doctors by Specialization
    getDoctorBySpecialization: async (req, res) => {
        try {
            const { specialization } = req.params;
            // console.log(specialization);
            const doctors = await UnifiedDoctor.find({ 'doctorSpecialization': specialization }).populate('user');
            res.status(200).json(doctors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get Doctors by Hospital
    getDoctorByHospital: async (req, res) => {
        try {
            const { hospitalName } = req.params;
            console.log(hospitalName);
            const doctors = await UnifiedDoctor.aggregate([
                {
                    $lookup: {
                        from: 'hospitals',
                        localField: 'hospitalID',
                        foreignField: '_id',
                        as: 'hospitalData'
                    }
                },
                {
                    $match: {
                        'hospitalData.hospitalName': hospitalName
                    }
                },
                {
                    $limit: 1
                }
            ]);
            res.status(200).json(doctors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = unifiedDoctorController;
