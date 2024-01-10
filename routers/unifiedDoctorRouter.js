const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.put('/updateUserDataDoctor/:userName', adminController.updateUserDataOfDoctorByUserName);
router.put('/updateDoctorData/:userName', adminController.updateDoctorDataByUserName);

module.exports = router;