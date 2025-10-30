import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientRegistration from './components/PatientRegistration';
import PatientList from './components/PatientList';
import PatientView from './components/PatientView';
import PatientEdit from './components/PatientEdit';
import AppointmentBooking from './components/AppointmentBooking';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />
        
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/patients/register" 
          element={user ? <PatientRegistration /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/patients" 
          element={user ? <PatientList /> : <Navigate to="/login" />} 
        />
        <Route
          path="/patients/:id"
          element={user ? <PatientView /> : <Navigate to="/login" />}
        />
        <Route
          path="/patients/:id/edit"
          element={user ? <PatientEdit /> : <Navigate to="/login" />}
        />
        
        <Route 
          path="/appointments" 
          element={user ? <AppointmentBooking /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;