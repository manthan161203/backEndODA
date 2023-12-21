const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/getAllDoctors', adminController.getDoctors);
router.get('/getDoctor/:username', adminController.getDoctorByUserName);
router.patch('/updateDoctor/:username', adminController.updateDoctorByUsername);
router.delete('/doctors/:username', adminController.deleteDoctorByUsername);
router.get('/hospitals', adminController.getHospital);
router.post('/hospitals', adminController.createHospital);
router.patch('/hospitals/:hospitalId', adminController.updateHospitalById);
router.delete('/hospitals/:hospitalId', adminController.deleteHospitalById);

module.exports = router;
