const Patient = require('../models/Patient');

// Register new patient
exports.registerPatient = async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search patient by MRN or name
exports.searchPatient = async (req, res) => {
  try {
    const { query } = req.query;
    const patients = await Patient.find({
      $or: [
        { mrn: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    });
    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    // Debug: log who is making the update and what is being updated (helpful during dev)
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[patientController.updatePatient] called by user:', req.user ? { id: req.user._id, role: req.user.role } : null);
        console.log('[patientController.updatePatient] payload:', req.body);
      } catch (e) { /* ignore logging errors */ }
    }
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    // Debug: log the resulting patient document (non-production only)
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[patientController.updatePatient] updated patient id:', patient._id, 'billPaid:', patient.billPaid, 'billAmount:', patient.billAmount);
      } catch (e) { /* ignore logging errors */ }
    }
    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get pending bills count
exports.getPendingCount = async (req, res) => {
  try {
    const count = await Patient.countDocuments({ billPaid: { $ne: true } });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dev-only: update patient without auth (useful for local testing).
exports.devUpdatePatient = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Not allowed in production' });
    }
    // Expecting body like { billPaid: true }
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    console.log('[patientController.devUpdatePatient] updated', patient._id.toString(), 'billPaid:', patient.billPaid);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};