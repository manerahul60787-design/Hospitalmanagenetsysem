const mongoose = require('mongoose');
require('dotenv').config();
const Patient = require('../models/Patient');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');
    const total = await Patient.countDocuments();
    const paid = await Patient.countDocuments({ billPaid: true });
    const unpaid = await Patient.countDocuments({ billPaid: { $ne: true } });
    console.log('Total patients:', total);
    console.log('Paid count:', paid);
    console.log('Unpaid count:', unpaid);

    const recent = await Patient.find().sort({ createdAt: -1 }).limit(10).select('name mrn billPaid billAmount');
    console.log('Recent patients sample:');
    recent.forEach(p => console.log(p._id.toString(), p.name, p.mrn, 'Paid:', p.billPaid, 'Amount:', p.billAmount));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
