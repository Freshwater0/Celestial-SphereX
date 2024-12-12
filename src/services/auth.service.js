import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/auth';

class AuthService {
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(username, email, password) {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password
      });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  }

  async getProfile() {
    try {
      const user = this.getCurrentUser();
      if (!user || !user.token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data.error || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response
      return new Error('No response from server');
    } else {
      // Error setting up request
      return new Error(error.message);
    }
  }
}

export default new AuthService();
