const Appointment = require('../models/appointmentSchema')
const Patient = require('../models/patientSchema')
const sendOTPViaEmail = require('../services/otpNodeMailer');

const sendEmailNotification = async (email) => {
    try {
        const toEmail = email;
        const subject = 'Appointment Status Update';
        const text = `Your appointment request is received and is Pending`;

        // Use your existing email sending service
        await sendOTPViaEmail(toEmail, subject, text);
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Failed to send email');
    }
};

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

    // Update user data of Patient by userName
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

    // Update Patient details by userName
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

    // Book an appointment
    bookAppointment: async (req, res) => {
        try {
            const { email } = req.params;
            const appointmentData = req.body;
            const appointment =  await Appointment.create(appointmentData);
            if(appointment){
                sendEmailNotification(email);
                res.status(200).json({message:"Appointment request is received"});
            }
            else{
                res.status(200).json({message:"Failed"})
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

module.exports = patientController;