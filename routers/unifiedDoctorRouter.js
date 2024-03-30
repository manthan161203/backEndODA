const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const doctorController = require('../controllers/unifiedDoctorController');

router.put('/updateUserDataDoctor/:userName', adminController.updateUserDataOfDoctorByUserName);
router.put('/updateDoctorData/:userName', adminController.updateDoctorDataByUserName);
router.get('/getAppointments/:doctorID', doctorController.getAppointmentsByDoctorID);
router.get('/getActiveAppointment/:doctorID', doctorController.getActiveAppointmentsByDoctorID);
router.put('/appointmentAorD/:appointmentID', doctorController.updateAppointmentStatus);
router.get('/getPatientInfo/:patientID', doctorController.getPatientInfo);
router.get('/getDoctorsBySpecialization/:specialization', doctorController.getDoctorBySpecialization);
router.get('/getDoctorsByHospital/:hospitalName', doctorController.getDoctorByHospital);
router.get('/getDoctorsByType/:doctorType', doctorController.getDoctorByType);
router.get('/getTodayAppointmentsCount/:doctorID', doctorController.getTodayAppointmentsCount);
router.get('/getUpComingAppointmentsCount/:doctorID', doctorController.getUpComingAppointmentsCount);
router.get('/getPendingAppointmentsCount/:doctorID', doctorController.getPendingAppointmentsCount);
router.get('/getPendingAppointments/:doctorID', doctorController.getPendingAppointmentsByDoctorID);
router.post('/acceptAppointment/:appointmentID', doctorController.acceptAppointment);
router.get('/getAppointmentsHistoryByDoctorID/:doctorID', doctorController.getAppointmentsHistoryByDoctorID);
router.get('/getAllDoctors', doctorController.getAllDoctors);
router.post('/createDoctor', doctorController.createDoctor);
router.get('/getAllAppointments', doctorController.getAllAppointments);
router.get('/getRoleBasedDetails/:userName', doctorController.getRoleBasedDetails);

module.exports = router;