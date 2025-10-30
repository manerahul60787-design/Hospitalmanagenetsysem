import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';
import { Save, ArrowLeft, UserPlus } from 'lucide-react';

function PatientRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    medicalHistory: {
      allergies: [],
      chronicDiseases: [],
      previousSurgeries: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayInput = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [field]: items
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await patientAPI.register(formData);
      
      if (response.data.success) {
        setSuccess(`Patient registered successfully! MRN: ${response.data.data.mrn}`);
        setTimeout(() => {
          navigate('/patients');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              marginRight: '12px',
              padding: '8px'
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ color: '#333', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserPlus size={32} style={{ color: '#667eea' }} />
              Patient Registration
            </h1>
            <p style={{ color: '#666', margin: '4px 0 0 44px' }}>
              Register a new patient in the system
            </p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <h3 style={{ color: '#667eea', marginBottom: '16px' }}>Personal Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter patient name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patient@example.com"
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <h3 style={{ color: '#667eea', marginTop: '30px', marginBottom: '16px' }}>Address</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                placeholder="Pincode"
              />
            </div>
          </div>

          <h3 style={{ color: '#667eea', marginTop: '30px', marginBottom: '16px' }}>Emergency Contact</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Contact Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                placeholder="Emergency contact name"
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                placeholder="Emergency contact phone"
              />
            </div>

            <div className="form-group">
              <label>Relation</label>
              <input
                type="text"
                name="emergencyContact.relation"
                value={formData.emergencyContact.relation}
                onChange={handleChange}
                placeholder="Relation (e.g., Father, Mother)"
              />
            </div>
          </div>

          <h3 style={{ color: '#667eea', marginTop: '30px', marginBottom: '16px' }}>Medical History</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Allergies</label>
              <input
                type="text"
                onChange={(e) => handleArrayInput('allergies', e.target.value)}
                placeholder="Separate by commas (e.g., Penicillin, Peanuts)"
              />
            </div>

            <div className="form-group">
              <label>Chronic Diseases</label>
              <input
                type="text"
                onChange={(e) => handleArrayInput('chronicDiseases', e.target.value)}
                placeholder="Separate by commas (e.g., Diabetes, Hypertension)"
              />
            </div>

            <div className="form-group">
              <label>Previous Surgeries</label>
              <input
                type="text"
                onChange={(e) => handleArrayInput('previousSurgeries', e.target.value)}
                placeholder="Separate by commas"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={20} />
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientRegistration;