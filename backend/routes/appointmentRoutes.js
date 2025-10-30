const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// POST /api/appointments - create appointment
router.post('/', appointmentController.createAppointment);

// GET /api/appointments/today-count - get today's appointment count
router.get('/today-count', appointmentController.getTodayCount);

// GET /api/appointments - list appointments
router.get('/', appointmentController.getAllAppointments);

module.exports = router;
