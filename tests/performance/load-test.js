import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_duration{staticAsset:yes}': ['p(95)<100'], // 95% of static asset requests must complete below 100ms
    errors: ['rate<0.1'], // Error rate must be less than 10%
  },
};

const BASE_URL = 'http://localhost:5000';

// Utility function to generate random user data
function generateRandomUser() {
  const randomId = Math.floor(Math.random() * 1000000);
  return {
    username: `user${randomId}`,
    email: `user${randomId}@example.com`,
    password: 'Password123!'
  };
}

// Test scenario
export default function() {
  const user = generateRandomUser();
  
  // Register
  const registerRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'RegisterUser' }
  });

  check(registerRes, {
    'register successful': (r) => r.status === 201,
    'has token': (r) => r.json('token') !== undefined,
  }) || errorRate.add(1);

  if (registerRes.status === 201) {
    const token = registerRes.json('token');
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Get profile
    const profileRes = http.get(`${BASE_URL}/api/auth/profile`, {
      headers: authHeaders,
      tags: { name: 'GetProfile' }
    });

    check(profileRes, {
      'profile successful': (r) => r.status === 200,
    }) || errorRate.add(1);

    // Update profile
    const updateProfileRes = http.put(`${BASE_URL}/api/profile`, JSON.stringify({
      bio: 'Test bio',
      location: 'Test City'
    }), {
      headers: authHeaders,
      tags: { name: 'UpdateProfile' }
    });

    check(updateProfileRes, {
      'update profile successful': (r) => r.status === 200,
    }) || errorRate.add(1);

    // Create notification
    const notificationRes = http.post(`${BASE_URL}/api/notifications`, JSON.stringify({
      title: 'Test Notification',
      message: 'This is a test notification'
    }), {
      headers: authHeaders,
      tags: { name: 'CreateNotification' }
    });

    check(notificationRes, {
      'create notification successful': (r) => r.status === 201,
    }) || errorRate.add(1);

    // Get notifications
    const getNotificationsRes = http.get(`${BASE_URL}/api/notifications`, {
      headers: authHeaders,
      tags: { name: 'GetNotifications' }
    });

    check(getNotificationsRes, {
      'get notifications successful': (r) => r.status === 200,
      'notifications is array': (r) => Array.isArray(r.json('notifications')),
    }) || errorRate.add(1);
  }

  sleep(1);
}
