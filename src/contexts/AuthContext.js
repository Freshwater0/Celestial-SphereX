import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const AuthContext = createContext();

// Custom error class for authentication
class AuthError extends Error {
  constructor(message, type = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.type = type;
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  // Configure axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  axios.defaults.headers.post['Content-Type'] = 'application/json';

  // Token management
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post('/api/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        return response.data.token;
      }
      throw new AuthError('Token refresh failed', 'TOKEN_REFRESH_ERROR');
    } catch (error) {
      // Force logout if refresh fails
      logout();
      throw error;
    }
  }, [token]);

  // Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If token is expired and we haven't retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  // Authorization header management
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Persistent storage management
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/auth/register', {
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password
      });
      
      if (response.data?.token && response.data?.user) {
        setToken(response.data.token);
        setUser(response.data.user);
        navigate('/dashboard');
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          message: response.data.message
        };
      }

      if (response.data?.requiresTwoFactor) {
        setTwoFactorRequired(true);
        return {
          success: true,
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        };
      }

      throw new AuthError('Invalid registration response');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           err.message || 
                           'Registration failed';
      
      setError(errorMessage);
      throw new AuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, twoFactorCode = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const loginData = twoFactorCode 
        ? { email, password, twoFactorCode }
        : { email, password };

      const response = await axios.post('/api/auth/login', loginData);
      
      if (response.data?.token && response.data?.user) {
        // Store authentication details securely
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set authentication state
        setToken(response.data.token);
        setUser(response.data.user);
        setTwoFactorRequired(false);

        // Personalized welcome
        const firstName = response.data.user.name?.split(' ')[0] || 'User';
        toast.success(`Welcome back, ${firstName}!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Redirect to dashboard
        navigate('/dashboard');
        return response.data;
      }

      if (response.data?.requiresTwoFactor) {
        setTwoFactorRequired(true);
        return {
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        };
      }

      throw new AuthError('Invalid login response');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      
      // Enhanced error notification
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setError(errorMessage);
      throw new AuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    setTwoFactorRequired(false);
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  }, []);

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    twoFactorRequired,
    register,
    login,
    logout,
    clearError,
    isTokenExpired,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
