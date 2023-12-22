const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/getAllDoctors', adminController.getDoctors);
router.get('/getDoctor/:username', adminController.getDoctorByUserName);
router.get('/getHospital', adminController.getHospital);
router.delete('/deleteDoctor', adminController.deleteDoctorByUsername);
router.patch('/updateDoctor/:username', adminController.updateDoctorByUsername);
router.post('/hospitals', adminController.createHospital);
router.patch('/hospitals/:hospitalId', adminController.updateHospitalById);
router.delete('/hospitals/:hospitalId', adminController.deleteHospitalById);

module.exports = router;
