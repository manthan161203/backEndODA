const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const doctorController = require('../controllers/unifiedDoctorController');

router.put('/updateUserDataDoctor/:userName', adminController.updateUserDataOfDoctorByUserName);
router.put('/updateDoctorData/:userName', adminController.updateDoctorDataByUserName);
router.get('/getAppointments/:doctorID', doctorController.getAppointmentsByDoctorID);
router.put('/appointmentAorD/:appointmentID', doctorController.updateAppointmentStatus);
router.get('/getPatientInfo/:patientID', doctorController.getPatientInfo);
router.get('/getDoctorsBySpecialization/:specialization', doctorController.getDoctorBySpecialization);
router.get('/getDoctorsByHospital/:hospitalName', doctorController.getDoctorByHospital);

module.exports = router;