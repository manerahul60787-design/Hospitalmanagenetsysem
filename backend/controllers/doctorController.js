const Doctor = require('../models/Doctor');

// Create doctor
exports.createDoctor = async (req, res) => {
  try {
    const count = await Doctor.countDocuments();
    req.body.doctorId = `DOC${String(count + 1).padStart(4, '0')}`;
    
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};