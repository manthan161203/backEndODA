const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const doctorController = require('../controllers/unifiedDoctorController');

router.get('/getAppointments/:patientID', patientController.getAppointmentsByPatientID);
router.get('/getDoctorsBySpecialization/:specialization', doctorController.getDoctorBySpecialization);
router.get('/getDoctorsByHospital/:hospitalName', doctorController.getDoctorByHospital);
router.get('/getRoleBasedDetails/:userName', patientController.getRoleBasedDetails);
router.put('/updateUserDataPatient/:userName', patientController.updateUserDataOfPatientByUserName);
router.put('/updatePatientData/:userName', patientController.updatePatientDataByUserName);
router.post('/bookAppointment/:emailID', patientController.bookAppointment);

module.exports = router;
