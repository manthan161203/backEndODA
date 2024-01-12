const Appointment = require('../models/appointmentSchema')

const patientController = {
    getAppointmentsByPatientID: async (req, res) => {
        try {
            const { patientID } = req.params;
            const appointments = await Appointment.find({ patient: patientID });
            res.status(200).json(appointments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
}

module.exports = patientController;