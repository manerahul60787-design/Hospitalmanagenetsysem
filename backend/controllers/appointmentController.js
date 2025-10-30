const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patient, doctor, appointmentDate, timeSlot, reason, notes } = req.body;

    // Basic validation
    if (!patient || !doctor || !appointmentDate) {
      return res.status(400).json({ success: false, message: 'patient, doctor and appointmentDate are required' });
    }

    // Optional: ensure patient and doctor exist
    const foundPatient = await Patient.findById(patient);
    if (!foundPatient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const foundDoctor = await Doctor.findById(doctor);
    if (!foundDoctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Normalize appointmentDate to server-local date (so counts match local "today")
    let apptDateObj = null;
    if (appointmentDate) {
      // Expecting a YYYY-MM-DD string from the client
      const parts = String(appointmentDate).split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        // new Date(year, monthIndex, day) creates a date in server local timezone at 00:00
        apptDateObj = new Date(y, m - 1, d);
      } else {
        apptDateObj = new Date(appointmentDate);
      }
    }

    const appt = new Appointment({
      patient,
      doctor,
      appointmentDate: apptDateObj || appointmentDate,
      timeSlot,
      reason,
      notes
    });

    await appt.save();

    res.status(201).json({ success: true, message: 'Appointment created successfully', data: appt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get today's appointment count
exports.getTodayCount = async (req, res) => {
  try {
    const now = new Date();

    // Build server-local YYYY-MM-DD for today
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Build timezone offset string for $dateToString (e.g. +05:30)
    const tzOffsetMin = -now.getTimezoneOffset(); // minutes ahead of UTC
    const tzSign = tzOffsetMin >= 0 ? '+' : '-';
    const tzHr = String(Math.floor(Math.abs(tzOffsetMin) / 60)).padStart(2, '0');
    const tzMin = String(Math.abs(tzOffsetMin) % 60).padStart(2, '0');
    const tz = `${tzSign}${tzHr}:${tzMin}`;

    // Count documents where appointmentDate formatted in server timezone equals today's date
    const count = await Appointment.countDocuments({
      $expr: {
        $eq: [
          { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate', timezone: tz } },
          todayStr
        ]
      }
    });

    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Optional: list appointments (with basic filter)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name mrn')
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: -1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
