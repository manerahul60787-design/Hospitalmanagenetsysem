const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { auth, authorize } = require('../middleware/auth');

// Dev-only route (no auth) to update patient for local testing. Only enabled when NODE_ENV !== 'production'
router.post('/:id/dev-update', async (req, res, next) => {
	if (process.env.NODE_ENV === 'production') return res.status(403).json({ success: false, message: 'Not allowed in production' });
	return patientController.devUpdatePatient(req, res, next);
});

router.post('/', auth, authorize('Admin', 'Receptionist'), patientController.registerPatient);
router.get('/', auth, patientController.getAllPatients);
router.get('/pending-count', auth, patientController.getPendingCount);
router.get('/search', auth, patientController.searchPatient);
router.get('/:id', auth, patientController.getPatientById);
router.put('/:id', auth, authorize('Admin', 'Receptionist'), patientController.updatePatient);

module.exports = router;