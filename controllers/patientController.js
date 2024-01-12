const Appointment = require('../models/appointmentSchema')
const Patient = require('../models/patientSchema')

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

    // Update user data of Doctor by userName
    updateUserDataOfPatientByUserName: async (req, res) => {
        try {
            const { userName } = req.params;
            const updatedData = req.body;

            const updatedUser = await User.findOneAndUpdate(
                { userName: userName },
                { $set: updatedData },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json(updatedUser);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // Update Doctor details by userName
    updatePatientDataByUserName: async (req, res) => {
        try {
            const { userName } = req.params;
            const updatedData = req.body;
            await Patient.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userData'
                    }
                },
                {
                    $match: {
                        'userData.userName': userName
                    }
                },
                {
                    $unwind: '$userData'
                },
                {
                    $set: updatedData
                },
                {
                    $project: {
                        userData: 0,
                    }
                },
                {
                    $merge: {
                        into: 'patients',
                        whenMatched: 'merge'
                    }
                }
            ]);
    
            return res.status(200).json({ message: 'Doctor Updated Successfully' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
}

module.exports = patientController;