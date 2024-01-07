const express = require('express');
const superAdminController = require('../controllers/superAdminController');

const router = express.Router();

router.get('/getAllAdmin', superAdminController.getAllAdmins);
router.get('/getAdmin/:userName', superAdminController.getByUserName);
router.get('/getAdmin/department/:department', superAdminController.getByDepartment);
// router.post('/createAdmin', superAdminController.createAdmin);
router.put('/updateUserDataAdmin/:userName', superAdminController.updateUserDataOfAdminByUserName);
router.put('/updateAdminData/:userName', superAdminController.updateAdminDataByUserName);
router.delete('/deleteAdmin/:userName', superAdminController.deleteAdminByUserName);
module.exports = router;
