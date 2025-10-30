import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Activity, FileText, UserPlus, Clock } from 'lucide-react';
import { patientAPI, appointmentAPI, userAPI } from '../services/api';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingBills: 0,
    activeStaff: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const handler = () => fetchDashboardData();
    window.addEventListener('patientUpdated', handler);
    return () => window.removeEventListener('patientUpdated', handler);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await patientAPI.getAll();
      if (response.data.success) {
        setStats(prev => ({
          ...prev,
          totalPatients: response.data.count
        }));
        setRecentPatients(response.data.data.slice(0, 5));
        // compute pending bills from the returned patient list as a fallback
        try {
          const pendingFromList = (response.data.data || []).filter(p => p.billPaid !== true).length;
          setStats(prev => ({ ...prev, pendingBills: pendingFromList }));
        } catch (e) {
          // ignore
        }
      }
      // fetch today's appointment count
      try {
        const apptRes = await appointmentAPI.getTodayCount();
        if (apptRes.data && apptRes.data.success) {
          setStats(prev => ({ ...prev, todayAppointments: apptRes.data.count }));
        }
      } catch (e) {
        console.error('Failed to fetch today appointments:', e);
      }
      // fetch pending bills count from server
      try {
        const pendingRes = await patientAPI.getPendingCount();
        if (pendingRes.data && pendingRes.data.success) {
          setStats(prev => ({ ...prev, pendingBills: pendingRes.data.count }));
        }
      } catch (e) {
        console.error('Failed to fetch pending bills count:', e);
        // keep the fallback computed from patient list (if any)
      }

      // fetch active staff count
      try {
        const staffRes = await userAPI.getActiveCount();
        if (staffRes.data && staffRes.data.success) {
          setStats(prev => ({ ...prev, activeStaff: staffRes.data.count }));
        }
      } catch (e) {
        console.error('Failed to fetch active staff count:', e);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: '#667eea',
      bgColor: '#e8eaf6'
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: '#28a745',
      bgColor: '#d4edda'
    },
    {
      title: 'Active Staff',
      value: stats.activeStaff,
      icon: Activity,
      color: '#fd7e14',
      bgColor: '#ffe5d0'
    },
    {
      title: 'Pending Bills',
      value: stats.pendingBills,
      icon: FileText,
      color: '#dc3545',
      bgColor: '#f8d7da'
    }
  ];

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
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'white', marginBottom: '8px' }}>Welcome, {user.fullName}!</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)' }}>
          Here's what's happening in your hospital today.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="card"
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: stat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={30} style={{ color: stat.color }} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  margin: '0 0 4px 0'
                }}>
                  {stat.value}
                </h3>
                <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
                  {stat.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/patients/register" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <UserPlus size={20} />
                Register New Patient
              </button>
            </Link>
            
            <Link to="/appointments" style={{ textDecoration: 'none' }}>
              <button className="btn-success" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Calendar size={20} />
                Book Appointment
              </button>
            </Link>
            
            <Link to="/patients" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Users size={20} />
                View All Patients
              </button>
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Recent Patients</h2>
          {recentPatients.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No patients registered yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentPatients.map((patient) => (
                <div
                  key={patient._id}
                  style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>{patient.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>MRN: {patient.mrn}</div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={14} />
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;