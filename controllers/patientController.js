const { response } = require('express');
const mongoose = require('mongoose');
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
            const { userName } = req.params;
            // console.log(userName);
            const appointments = await Appointment.aggregate([
                {
                    $lookup: {
                        from: 'patients',
                        localField: 'patient',
                        foreignField: '_id',
                        as: 'patientInfo',
                    },
                },
                {
                    $unwind: '$patientInfo',
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'patientInfo.user',
                        foreignField: '_id',
                        as: 'userInfo',
                    },
                },
                {
                    $unwind: '$userInfo',
                },
                {
                    $match: {
                        'userInfo.userName': userName,
                    },
                },
                {
                    $sort:{
                        date:-1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        appointmentId: 1,
                        patient: '$patientInfo._id',
                        doctor: 1,
                        date: 1,
                        slot: 1,
                        status: 1,
                        prerequisite: 1,
                        recommendedDoctors: 1,
                        notes: 1,
                        createdAt: 1,
                        updatedAt: 1,
                    },
                },
            ]);
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
    
            return res.status(200).json({ message: 'Patient Updated Successfully' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },


    createPatient: async (req, res) => {
        try {
            const patientData = req.body;
            // console.log('Received patient data:', patientData);
    
            const userId = patientData.user;
            if (!userId) {
                // console.error('User ID is missing in the request body.');
                return res.status(400).json({ message: 'User ID is required.' });
            }
    
            let userObjectId;
            try {
                userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
            } catch (error) {
                // console.error('Invalid User ID format:', error.message);
                return res.status(400).json({ message: 'Invalid User ID format.' });
            }
    
            patientData.user = userObjectId;
            // console.log('Updated patient data:', patientData);
    
            const createdPatient = await Patient.create(patientData);
            // console.log('Patient Created:', createdPatient);
    
            return res.status(200).json({ message: 'Patient Created Successfully', patient: createdPatient });
        } catch (error) {
            console.error('Error creating patient:', error.message);
            return res.status(500).json({ message: 'Error creating patient', error: error.message });
        }
    },
    
    // Book an appointment
    bookAppointment: async (req, res) => {
        try {
            const { emailID } = req.params;
            const appointmentData = req.body;
            appointmentData.appointmentId = (Date.now())*2;
            const appointment =  await Appointment.create(appointmentData);
            if(appointment){
                sendEmailNotification(emailID);
                res.status(200).json({message:"Appointment request is received"});
            }
            else{
                res.status(200).json({message:"Failed"})
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Get Role Based Details
    getRoleBasedDetails: async (req, res) => {
        try {
            const { userName } = req.params;
            // console.log(userName);

            const data = await Patient.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $match: {
                        'user.userName': userName
                    }
                },
                {
                    $unwind: '$user',
                },
                {
                    $limit: 1
                }
            ]);
            res.status(200).send(data);
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error"});
        }
    }
}

module.exports = patientController;