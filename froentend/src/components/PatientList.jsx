import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../services/api';
import { Search, UserPlus, Eye, Edit, Phone, Mail } from 'lucide-react';

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
    const handler = () => fetchPatients();
    window.addEventListener('patientUpdated', handler);
    return () => window.removeEventListener('patientUpdated', handler);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.includes(searchQuery)
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getAll();
      if (response.data.success) {
        setPatients(response.data.data);
        setFilteredPatients(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ color: '#333', margin: '0 0 8px 0' }}>Patient Management</h1>
            <p style={{ color: '#666', margin: 0 }}>
              Total Patients: {patients.length}
            </p>
          </div>
          
          <Link to="/patients/register" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={20} />
              Register New Patient
            </button>
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999'
              }}
            />
            <input
              type="text"
              placeholder="Search by name, MRN, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '44px',
                width: '100%'
              }}
            />
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            {searchQuery ? 'No patients found matching your search.' : 'No patients registered yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Name</th>
                  <th>Age/Gender</th>
                  <th>Contact</th>
                  <th>Blood Group</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient._id}>
                    <td>
                      <span style={{
                        background: '#e8eaf6',
                        color: '#667eea',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        fontSize: '12px'
                      }}>
                        {patient.mrn}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#333' }}>{patient.name}</div>
                      {patient.email && (
                        <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Mail size={12} />
                          {patient.email}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{calculateAge(patient.dateOfBirth)} years</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{patient.gender}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} style={{ color: '#667eea' }} />
                        {patient.phone}
                      </div>
                    </td>
                    <td>
                      {patient.bloodGroup ? (
                        <span style={{
                          background: '#ffe5d0',
                          color: '#fd7e14',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: '600',
                          fontSize: '12px'
                        }}>
                          {patient.bloodGroup}
                        </span>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/patients/${patient._id}`} style={{ textDecoration: 'none' }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="View Details"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </Link>
                        <Link to={`/patients/${patient._id}/edit`} style={{ textDecoration: 'none' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Edit Patient"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        </Link>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '8px' }}>
                          <div style={{ fontSize: '12px', color: '#666' }}>Bill</div>
                          <div style={{ fontWeight: 700 }}>{patient.billPaid ? 'Paid' : 'Not Paid'}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientList;