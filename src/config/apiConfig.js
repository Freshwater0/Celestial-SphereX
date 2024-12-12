const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const apiConfig = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    SCHEDULING: {
      CREATE: '/schedules/create',
      LIST: '/schedules',
      UPDATE: '/schedules/:id',
      DELETE: '/schedules/:id'
    }
  },
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export default apiConfig;
