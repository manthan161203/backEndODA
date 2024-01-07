const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/getAllDoctors', adminController.getDoctors);
router.post('/getDoctorsByHospitalID', adminController.getDoctorsByHospitalID);
router.get('/getDoctor/:username', adminController.getDoctorByUserName);
router.delete('/deleteDoctor/:username', adminController.deleteDoctorByUsername);
router.put('/updateUserDataDoctor/:userName', adminController.updateUserDataOfDoctorByUserName);
router.put('/updateDoctorData/:userName', adminController.updateDoctorDataByUserName);
router.put('/updateHospital/:hospitalId', adminController.updateHospitalById);
router.post('/createHospital', adminController.createHospital);
router.post('/getHospital', adminController.getHospital);
router.delete('/deleteHospital/:hospitalId', adminController.deleteHospitalById);

module.exports = router;
