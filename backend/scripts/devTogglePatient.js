const mongoose = require('mongoose');
require('dotenv').config();
const Patient = require('../models/Patient');

// Usage: node scripts/devTogglePatient.js <patientId>
(async function() {
  try {
    const id = process.argv[2];
    if (!id) {
      console.log('Usage: node scripts/devTogglePatient.js <patientId>');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const p = await Patient.findById(id).lean();
    if (!p) {
      console.log('Patient not found:', id);
      process.exit(1);
    }
    console.log('Current:', p._id.toString(), p.name, 'billPaid:', p.billPaid);

  // Toggle locally
    const updated = await Patient.findByIdAndUpdate(id, { billPaid: !p.billPaid }, { new: true });
    console.log('Updated:', updated._id.toString(), 'billPaid:', updated.billPaid);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
