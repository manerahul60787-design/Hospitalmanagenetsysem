import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';

function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await patientAPI.getById(id);
        if (res.data.success) setPatient(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load patient');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return (
    <div className="container"><div className="loading"><div className="spinner"></div></div></div>
  );

  if (!patient) return (
    <div className="container"><div className="loading"><div className="spinner"></div></div></div>
  );

  return (
    <div className="container">
      <div className="card">
  {error && <div style={{ marginBottom: '12px' }} className="alert alert-error">{error}</div>}
  {success && <div style={{ marginBottom: '12px' }} className="alert alert-success">{success}</div>}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', marginRight: '12px', padding: '8px' }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ margin: 0 }}>{patient.name}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <h3>Personal Info</h3>
            <p><strong>MRN:</strong> {patient.mrn}</p>
            <p><strong>Email:</strong> {patient.email || '-'}</p>
            <p><strong>Phone:</strong> {patient.phone}</p>
            <p><strong>DOB:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Blood Group:</strong> {patient.bloodGroup || '-'}</p>
          </div>

          <div>
            <h3>Address</h3>
            <p>{patient.address?.street || ''}</p>
            <p>{patient.address?.city || ''} {patient.address?.state ? `, ${patient.address.state}` : ''}</p>
            <p>{patient.address?.pincode || ''}</p>

            <h3 style={{ marginTop: '16px' }}>Emergency Contact</h3>
            <p><strong>Name:</strong> {patient.emergencyContact?.name || '-'}</p>
            <p><strong>Phone:</strong> {patient.emergencyContact?.phone || '-'}</p>
            <p><strong>Relation:</strong> {patient.emergencyContact?.relation || '-'}</p>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Medical History</h3>
          <p><strong>Allergies:</strong> {(patient.medicalHistory?.allergies || []).join(', ') || '-'}</p>
          <p><strong>Chronic Diseases:</strong> {(patient.medicalHistory?.chronicDiseases || []).join(', ') || '-'}</p>
          <p><strong>Previous Surgeries:</strong> {(patient.medicalHistory?.previousSurgeries || []).join(', ') || '-'}</p>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-primary" onClick={() => navigate(`/patients/${id}/edit`)}>Edit Patient</button>
            <button className="btn-secondary" onClick={() => navigate('/patients')}>Back to list</button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Bill Amount</div>
              <div style={{ fontWeight: '700', color: '#333' }}>₹ {patient.billAmount || 0}</div>
            </div>

            <div style={{ marginLeft: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Payment Status</div>
              <div style={{ fontWeight: '700' }}>{patient.billPaid ? 'Paid' : 'Not Paid'}</div>
            </div>

            {/* Role-based action: only Admin or Receptionist can toggle payment */}
            {(() => {
              try {
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                if (user && (user.role === 'Admin' || user.role === 'Receptionist')) {
                  return (
                    <button
                          className={patient.billPaid ? 'btn-secondary' : 'btn-success'}
                          onClick={async () => {
                            setError('');
                            setSuccess('');
                            // ensure we have a token
                            const token = localStorage.getItem('token');
                            if (!token) {
                              setError('You must be logged in to perform this action. Please login again.');
                              return;
                            }

                            // prepare payload
                            const newStatus = !patient.billPaid;
                            const payload = { billPaid: newStatus };
                            // log for debugging
                            console.debug('[PatientView] updating patient', id, 'payload:', payload, 'tokenPresent:', !!token);

                            try {
                              setUpdating(true);
                              // toggle
                              const updated = await patientAPI.update(id, payload);
                              console.debug('[PatientView] update response:', updated?.data);
                              if (updated.data && updated.data.success) {
                                // use server returned patient to ensure consistency
                                setPatient(updated.data.data || { ...patient, billPaid: newStatus });
                                // notify other components (Dashboard, PatientList) to refresh
                                try { window.dispatchEvent(new Event('patientUpdated')); } catch (e) { /* ignore */ }
                                setSuccess('Payment status updated');
                              } else {
                                setError(updated.data?.message || 'Failed to update payment status');
                              }
                            } catch (err) {
                              console.error('Failed to update bill status', err);
                              setError(err.response?.data?.message || err.message || 'Failed to update payment status');
                            } finally {
                              setUpdating(false);
                              // clear success after short time
                              setTimeout(() => setSuccess(''), 2500);
                            }
                          }}
                          style={{ padding: '8px 12px' }}
                          disabled={updating}
                        >
                          {updating ? (patient.billPaid ? 'Marking Unpaid...' : 'Marking Paid...') : (patient.billPaid ? 'Mark Unpaid' : 'Mark Paid')}
                        </button>
                  );
                }
              } catch (e) {
                return null;
              }
              return null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientView;
