const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/doctors', adminController.getDoctors);
router.get('/doctors/:username', adminController.getDoctorByUserName);
router.patch('/doctors/:username', adminController.updateDoctorByUsername);
router.delete('/doctors/:username', adminController.deleteDoctorByUsername);
router.get('/hospitals', adminController.getHospital);
router.post('/hospitals', adminController.createHospital);
router.patch('/hospitals/:hospitalId', adminController.updateHospitalById);
router.delete('/hospitals/:hospitalId', adminController.deleteHospitalById);

module.exports = router;
