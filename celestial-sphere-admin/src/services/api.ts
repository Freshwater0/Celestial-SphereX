import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const adminService = {
  login: (email: string, password: string) => 
    api.post('/admin/login', { email, password }),
  
  getUsers: (page = 1, pageSize = 10, search = '', status = null) => 
    api.get('/admin/users', { 
      params: { page, pageSize, search, status } 
    }),
  
  updateUserStatus: (userId: string, status: string, reason?: string) => 
    api.patch(`/admin/users/${userId}/status`, { status, reason }),
  
  manageSubscription: (userId: string, action: string) => 
    api.post(`/admin/subscriptions/${userId}/manage`, { action }),
  
  generateReport: (reportType: string) => 
    api.get('/admin/reports', { params: { reportType } })
};

export default api;
