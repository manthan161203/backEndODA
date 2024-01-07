const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/getAllDoctors', adminController.getDoctors);
router.post('/getDoctorsByHospitalID', adminController.getDoctorsByHospitalID); // half
router.get('/getDoctor/:username', adminController.getDoctorByUserName);

router.delete('/deleteDoctor', adminController.deleteDoctorByUsername);
router.patch('/updateDoctor/:username', adminController.updateDoctorByUsername);
router.patch('/hospitals/:hospitalId', adminController.updateHospitalById);

router.post('/createHospital', adminController.createHospital);
router.post('/getHospital', adminController.getHospital);
router.delete('/deleteHospital/:hospitalId', adminController.deleteHospitalById);

module.exports = router;
