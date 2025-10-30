import React, { useState, useEffect } from 'react';
import { patientAPI, doctorAPI, appointmentAPI } from '../services/api';
import { Calendar, Clock, User, Stethoscope, Save } from 'lucide-react';

function AppointmentBooking() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    appointmentDate: '',
    timeSlot: '',
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        patientAPI.getAll(),
        doctorAPI.getAll()
      ]);
      
      if (patientsRes.data.success) {
        setPatients(patientsRes.data.data);
      }
      if (doctorsRes.data.success) {
        setDoctors(doctorsRes.data.data);
      }
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Call the appointment API to save booking
      const payload = {
        patient: formData.patient,
        doctor: formData.doctor,
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot,
        reason: formData.reason,
        notes: formData.notes
      };

      const res = await appointmentAPI.create(payload);
      if (res.data && res.data.success) {
        setSuccess('Appointment booked successfully!');
        // Optionally you can trigger any further refresh here
      } else {
        throw new Error(res.data?.message || 'Failed to book appointment');
      }
      setFormData({
        patient: '',
        doctor: '',
        appointmentDate: '',
        timeSlot: '',
        reason: '',
        notes: ''
      });
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  return (
    <div className="container">
      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: '#333', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={32} style={{ color: '#667eea' }} />
            Book Appointment
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            Schedule a new appointment for a patient
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: '#667eea' }} />
                Select Patient *
              </label>
              <select
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                required
              >
                <option value="">Choose a patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name} - {patient.mrn}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={18} style={{ color: '#667eea' }} />
                Select Doctor *
              </label>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                required
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: '#667eea' }} />
                Appointment Date *
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: '#667eea' }} />
                Time Slot *
              </label>
              <select
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                required
              >
                <option value="">Choose a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Visit *</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter reason for appointment"
              required
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information..."
              rows="4"
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={20} />
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setFormData({
                  patient: '',
                  doctor: '',
                  appointmentDate: '',
                  timeSlot: '',
                  reason: '',
                  notes: ''
                });
              }}
              className="btn-secondary"
            >
              Clear Form
            </button>
          </div>
        </form>

        {doctors.length === 0 && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            color: '#856404'
          }}>
            <strong>Note:</strong> No doctors available. Please add doctors first to book appointments.
          </div>
        )}

        {patients.length === 0 && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            color: '#856404'
          }}>
            <strong>Note:</strong> No patients registered. Please register patients first.
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentBooking;


