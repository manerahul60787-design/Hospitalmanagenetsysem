const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('Admin'), doctorController.createDoctor);
router.get('/', auth, doctorController.getAllDoctors);

module.exports = router;