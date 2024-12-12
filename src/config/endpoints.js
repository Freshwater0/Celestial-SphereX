const API_BASE_URL = 'http://localhost:5555/api';

export const endpoints = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/auth/me`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: (token) => `${API_BASE_URL}/auth/reset-password/${token}`,
    verifyEmail: (token) => `${API_BASE_URL}/auth/verify-email/${token}`,
    googleAuth: `${API_BASE_URL}/auth/google`,
    logout: `${API_BASE_URL}/auth/logout`,
    changePassword: `${API_BASE_URL}/auth/change-password`,
  },
};

export default endpoints;
