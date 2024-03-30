const { response } = require('express');
const mongoose = require('mongoose');
const Appointments = require('../models/appointmentSchema');
const Patient = require('../models/patientSchema');
const UnifiedDoctor = require('../models/unifiedDoctorSchema');
const sendOTPViaEmail = require('../services/otpNodeMailer');
const moment = require("moment");
const Appointment = require('../models/appointmentSchema');
const sendEmailNotification = async (appointment) => {
    try {
        const toEmail = appointment.patient.user.email;
        const subject = 'Appointment Status Update';
        var text;
        if(appointment.status == 'Accepted') {
            if(appointment.prerequisites != "") {
                text = `Your appointment has been Accepted.Prerequisites: ${appointment.prerequisite}`;
            }
            else{
                text = `Your appointment has been Accepted.`;
            }
        } else if(appointment.status == 'Pending') {
            text = `Your appointment request is received and is Pending`;
        } else{
            text = `Sorry, but your appointment is Rejected.Recommended Doctors: ${appointment.recommendedDoctors}`;
        }

        // Use your existing email sending service
        await sendOTPViaEmail(toEmail, subject, text);
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Failed to send email');
    }
};

const unifiedDoctorController = {
    getAppointmentsByDoctorID: async (req, res) => {
        try {
            const doctorId = await UnifiedDoctor.findOne({user:req.params.doctorID},{doctor:true});
            console.log(doctorId)
            const appointments = await Appointments.find({'doctor': doctorId._id}).sort({date:1}).populate({path: 'patient', populate: 'user'}).exec();
            // console.log(appointments);
            res.status(200).json(appointments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    getAllAppointments: async (req, res) => {
        try {
            const appointments = await Appointment.find();
            res.status(200).json(appointments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    getActiveAppointmentsByDoctorID: async (req, res) => {
        try {
            const doctorId = await UnifiedDoctor.findOne({user:req.params.doctorID},{doctor:true});
            console.log(doctorId)
            const appointments = await Appointments.find({'doctor': doctorId._id,status:'Active'}).populate({path: 'patient', populate: 'user'}).exec();
            console.log(appointments);
            if(appointments.length == 0){
                res.status(200).json(0);
            }else{
                res.status(200).json(appointments);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    getAppointmentsHistoryByDoctorID: async (req, res) => {
        try {
            const doctorId = await UnifiedDoctor.findOne({user:req.params.doctorID},{doctor:true});
            console.log(doctorId)
            const appointments = await Appointments.find({'doctor': doctorId._id}).populate({path: 'doctor', populate: 'user'}).populate({path: 'patient', populate: 'user'}).exec();
            console.log(appointments);
            if(appointments.length == 0){
                res.status(200).json(0);
            }else{
                res.status(200).json(appointments);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    getUpComingAppointmentsByDoctorID: async (req, res) => {
        try {
            const doctorId = await UnifiedDoctor.findOne({user:req.params.doctorID},{doctor:true});
            console.log(doctorId)
            const appointments = await Appointments.find({'doctor': doctorId._id,status:'Accepted'}).populate({path: 'patient', populate: 'user'}).exec();
            const upcomingAppointments = appointments.filter((app)=>{
                if(moment().isBefore(moment(appointments.date))){
                    return app;
                }
            })
            const sortedAppointments  = upcomingAppointments.sort((a,b) => new moment(a.date).format('YYYYMMDD') - new moment(b.date).format('YYYYMMDD'))
            console.log(sortedAppointments);
            res.status(200).json(sortedAppointments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    getTodayAppointmentsByDoctorID: async (req, res) => {
        try {
            const doctorId = await UnifiedDoctor.findOne({user:req.params.doctorID},{doctor:true});
            console.log(doctorId)
            const appointments = await Appointments.find({'doctor': doctorId._id,status:'Accepted'}).sort({date:1}).populate({path: 'patient', populate: 'user'}).exec();
            const todayAppointments = appointments.filter((app)=>{
                if(moment().isSame(moment(appointments.date))){
                    return app;
                }
            })
            res.status(200).json(todayAppointments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    getPendingAppointmentsByDoctorID: async (req, res) => {
        try {
            const doctorId = await UnifiedDoctor.findOne({user:req.params.doctorID},{_id:true});
            console.log(doctorId)
            const appointments = await Appointments.find({'doctor': doctorId._id,status:'Pending'}).populate({path: 'patient', populate: 'user'}).exec().sort({date:-1});
            const expAppointments = appointments.filter((app)=>{
                if(!moment().isSame(moment(app.date))){
                    if(moment().isAfter(moment(app.date))){
                        return app;
                    }
                }
            })
            const pendingAppointmnets = appointments.filter((app)=>{
                if(moment().isBefore(moment(app.date))){
                    return app;
                }
            })

            for(const appointment of expAppointments){
                await Appointments.findByIdAndUpdate(appointment._id,{status:"Rejected"});
            }
            console.log(pendingAppointmnets);
            res.status(200).json(pendingAppointmnets);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    getUpComingAppointmentsCount: async (req, res) => {
        try {
            const doctorId = await UnifiedDoctor.findOne({user:req.params.doctorID},{doctor:true});
            // console.log(doctorId)
            const appointments = (await Appointments.find({'doctor': doctorId._id,status:'Accepted'}).populate({path: 'patient', populate: 'user'}).sort({date:-1}).exec());
            // console.log(appointments)
            const upcomingAppointments = appointments.filter((app)=>{
                if(moment().isBefore(moment(app.date))){
                    return app;
                }
            })
            // console.log(upcomingAppointments);
            res.status(200).json(upcomingAppointments.length??0);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    getTodayAppointmentsCount: async (req, res) => {
        try {
            
            const doctorId = await UnifiedDoctor.findOne({user:req.params.doctorID},{doctor:true});
            const appointments = await Appointments.find({'doctor': doctorId._id,status:'Accepted'}).populate({path: 'patient', populate: 'user'}).exec();
            const todayAppointments = appointments.filter((app)=>{
                if(moment().isSame(moment(app.date))){
                    return app;
                }
            })
            // console.log(todayAppointments)
            res.status(200).json(todayAppointments.length??0);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    getPendingAppointmentsCount: async (req, res) => {
        try {
            const doctorId = await UnifiedDoctor.findOne({user:req.params.doctorID},{doctor:true});
            const appointments = await Appointments.find({'doctor': doctorId._id,status:'Pending'}).populate({path: 'patient', populate: 'user'}).exec();
            const expAppointments = appointments.filter((app)=>{
                if(!moment().isSame(moment(app.date))){
                    if(moment().isAfter(moment(app.date))){
                        return app;
                    }
                }
            })
            const pendingAppointmnets = appointments.filter((app)=>{
                if(moment().isBefore(moment(app.date))){
                    console.log(app.date)
                    return app;
                }
            })

            for(const appointment of expAppointments){
                await Appointments.findByIdAndUpdate(appointment._id,{status:"Rejected"});
            }
            // console.log(pendingAppointmnets);
            res.status(200).json(pendingAppointmnets.length??0);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    // Update Appointment Status
    acceptAppointment: async (req, res) => {
        try {
            const { appointmentID } = req.params;
            const appointment = await Appointments.findByIdAndUpdate(appointmentID,
                { $set:{status : 'Accepted' , prerequisite:req.body.prerequisite, notes:req.body.notes}},
                { new: true }
            ).populate({path: 'patient', populate: 'user'}).exec();

            await sendEmailNotification(appointment);
            // res.status(200).json({ message: 'Appointment status updated successfully' });
            res.status(200).json(appointment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    updateAppointmentStatus: async (req, res) => {
        try {
            const { appointmentID } = req.params;
            const data = req.body;
            const updatedAppointment = await Appointments.findOneAndUpdate(
                { appointmentId: appointmentID },
                { $set: data },
                { new: true }
            ).populate({path: 'patient', populate: 'user'}).exec();

            await sendEmailNotification(updatedAppointment);
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

    createDoctor: async (req, res) => {
        try {
            // console.log("Hii");
            const doctorData = req.body;
            const userId = doctorData.user;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required.' });
            }
            
            let userObjectId;
            try {
                userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
                // console.log(doctorData);
            } catch (error) {
                return res.status(400).json({ message: 'Invalid User ID format.' });
            }
            
            doctorData.user = userObjectId;
            if (doctorData.doctorType === 'doctor') {
                const hospitalId = doctorData.hospitalID;
                if (hospitalId) {
                    doctorData.hospitalID = mongoose.Types.ObjectId.createFromHexString(hospitalId);
                } else {
                    return res.status(400).json({ message: 'Hospital ID is required for Doctor type.' });
                }
            }
            const createdDoctor = await UnifiedDoctor.create(doctorData);
            
            return res.status(200).json({ message: 'Doctor Created Successfully', doctor: createdDoctor });
        } catch (error) {
            console.error('Error creating doctor:', error.message);
            return res.status(500).json({ message: 'Error creating doctor', error: error.message });
        }
    },
    
    // Get Role Based Details
    getRoleBasedDetails: async (req, res) => {
        try {
            const { userName } = req.params;
            // console.log(userName);

            const data = await UnifiedDoctor.aggregate([
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

    // Get Doctors by Type
    getDoctorByType: async (req, res) => {
        try {
            const { doctorType } = req.params;
            // console.log(specialization);
            const doctors = await UnifiedDoctor.find({ 'doctorType': doctorType }).populate(['user', 'hospitalID']);
            res.status(200).json(doctors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get All Doctors
    getAllDoctors: async (req, res) => {
        try {
            const doctors = await UnifiedDoctor.find().populate('user');
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
            // console.log(hospitalName);
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
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
            ]);
            res.status(200).json(doctors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = unifiedDoctorController;
