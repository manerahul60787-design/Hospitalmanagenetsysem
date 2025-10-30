import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';
import { Save, ArrowLeft } from 'lucide-react';

function PatientEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await patientAPI.getById(id);
        if (res.data.success) setFormData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load patient');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayInput = (field, value) => {
    const items = value.split(',').map(i => i.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, medicalHistory: { ...prev.medicalHistory, [field]: items } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Build payload - include billing fields if present
      const payload = { ...formData };
      // ensure billAmount is a number
      if (payload.billAmount !== undefined && payload.billAmount !== null) {
        payload.billAmount = Number(payload.billAmount) || 0;
      }

      const res = await patientAPI.update(id, payload);
      if (res.data.success) {
        setSuccess('Patient updated successfully');
        // notify other components to refresh
        try { window.dispatchEvent(new Event('patientUpdated')); } catch (e) {}
        // also update local formData from server response to reflect saved values
        if (res.data.data) setFormData(res.data.data);
        setTimeout(() => navigate('/patients'), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update patient');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (<div className="container"><div className="loading"><div className="spinner"></div></div></div>);
  if (!formData) return null;

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', marginRight: '12px', padding: '8px' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ margin: 0 }}>Edit Patient</h1>
            <p style={{ color: '#666' }}>Update patient details</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender || 'Male'} onChange={handleChange} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange}>
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

          {/* Billing - only editable by Admin/Receptionist */}
          {(() => {
            try {
              const user = JSON.parse(localStorage.getItem('user') || 'null');
              if (user && (user.role === 'Admin' || user.role === 'Receptionist')) {
                return (
                  <>
                    <h3 style={{ color: '#667eea', marginTop: '20px' }}>Billing</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div className="form-group">
                        <label>Bill Amount (₹)</label>
                        <input type="number" name="billAmount" value={formData.billAmount || 0} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Payment Status</label>
                        <select name="billPaid" value={String(formData.billPaid || false)} onChange={(e) => setFormData(prev => ({ ...prev, billPaid: e.target.value === 'true' }))}>
                          <option value="false">Not Paid</option>
                          <option value="true">Paid</option>
                        </select>
                      </div>
                    </div>
                  </>
                );
              }
            } catch (e) {
              return null;
            }
            return null;
          })()}

          <h3 style={{ color: '#667eea', marginTop: '20px' }}>Address</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" name="address.street" value={formData.address?.street || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" name="address.city" value={formData.address?.city || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" name="address.state" value={formData.address?.state || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input type="text" name="address.pincode" value={formData.address?.pincode || ''} onChange={handleChange} />
            </div>
          </div>

          <h3 style={{ color: '#667eea', marginTop: '20px' }}>Emergency Contact</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Contact Name</label>
              <input type="text" name="emergencyContact.name" value={formData.emergencyContact?.name || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input type="tel" name="emergencyContact.phone" value={formData.emergencyContact?.phone || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Relation</label>
              <input type="text" name="emergencyContact.relation" value={formData.emergencyContact?.relation || ''} onChange={handleChange} />
            </div>
          </div>

          <h3 style={{ color: '#667eea', marginTop: '20px' }}>Medical History</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Allergies</label>
              <input type="text" defaultValue={(formData.medicalHistory?.allergies || []).join(', ')} onChange={(e) => handleArrayInput('allergies', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Chronic Diseases</label>
              <input type="text" defaultValue={(formData.medicalHistory?.chronicDiseases || []).join(', ')} onChange={(e) => handleArrayInput('chronicDiseases', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Previous Surgeries</label>
              <input type="text" defaultValue={(formData.medicalHistory?.previousSurgeries || []).join(', ')} onChange={(e) => handleArrayInput('previousSurgeries', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/patients')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientEdit;
