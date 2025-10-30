const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  mrn: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  medicalHistory: {
    allergies: [String],
    chronicDiseases: [String],
    previousSurgeries: [String]
  }
  ,
  // Billing fields
  billAmount: {
    type: Number,
    default: 0
  },
  billPaid: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-generate MRN before saving
patientSchema.pre('save', async function(next) {
  if (this.isNew && !this.mrn) {
    const count = await mongoose.model('Patient').countDocuments();
    this.mrn = `MRN${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);