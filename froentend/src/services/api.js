import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
};

// Patient APIs
export const patientAPI = {
  register: (patientData) => api.post('/patients', patientData),
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  search: (query) => api.get(`/patients/search?query=${query}`),
  update: (id, patientData) => api.put(`/patients/${id}`, patientData),
  getPendingCount: () => api.get('/patients/pending-count'),
};

// Doctor APIs
export const doctorAPI = {
  create: (doctorData) => api.post('/doctors', doctorData),
  getAll: () => api.get('/doctors'),
};

// User APIs
export const userAPI = {
  getActiveCount: () => api.get('/users/active-count'),
};

// Appointment APIs
export const appointmentAPI = {
  create: (appointmentData) => api.post('/appointments', appointmentData),
  getTodayCount: () => api.get('/appointments/today-count'),
  getAll: () => api.get('/appointments')
};

export default api;