import React from 'react';
import { Link } from 'react-router-dom';
import { Hospital, LogOut, LayoutDashboard, Users, Calendar } from 'lucide-react';

function Navbar({ user, onLogout }) {
  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '16px 24px',
      marginBottom: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Hospital size={32} style={{ color: '#667eea' }} />
          <h2 style={{ color: '#333', margin: 0 }}>HMS</h2>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link 
            to="/dashboard" 
            style={{ 
              textDecoration: 'none', 
              color: '#667eea', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          
          <Link 
            to="/patients" 
            style={{ 
              textDecoration: 'none', 
              color: '#667eea', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={18} />
            Patients
          </Link>
          
          <Link 
            to="/appointments" 
            style={{ 
              textDecoration: 'none', 
              color: '#667eea', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={18} />
            Appointments
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600', color: '#333' }}>{user.fullName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{user.role}</div>
          </div>
          
          <button 
            onClick={onLogout}
            className="btn-danger"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '8px 16px'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;