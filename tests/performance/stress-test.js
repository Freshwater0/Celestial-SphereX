import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 500,
      timeUnit: '1s',
      stages: [
        { duration: '2m', target: 10 },  // Below normal load
        { duration: '5m', target: 50 },  // Normal load
        { duration: '2m', target: 100 }, // Around breaking point
        { duration: '5m', target: 200 }, // Beyond breaking point
        { duration: '2m', target: 0 },   // Scale down
      ],
      gracefulStop: '2m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    errors: ['rate<0.15'],             // Error rate must be less than 15%
  },
};

const BASE_URL = 'http://localhost:5000';

// Utility functions
function randomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

function generateRandomUser() {
  const username = randomString(8);
  return {
    username,
    email: `${username}@example.com`,
    password: 'Password123!'
  };
}

export default function() {
  const user = generateRandomUser();
  
  // Heavy operations to stress the system
  group('Authentication', function() {
    // Register new user
    const registerRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' }
    });

    if (check(registerRes, {
      'register successful': (r) => r.status === 201,
    })) {
      const token = registerRes.json('token');
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Create multiple notifications
      for (let i = 0; i < 5; i++) {
        const notificationRes = http.post(`${BASE_URL}/api/notifications`, JSON.stringify({
          title: `Stress Test ${i}`,
          message: `Stress test notification ${i}`
        }), {
          headers: authHeaders
        });

        check(notificationRes, {
          'notification created': (r) => r.status === 201,
        }) || errorRate.add(1);
      }

      // Get all notifications (potentially large dataset)
      const getNotificationsRes = http.get(`${BASE_URL}/api/notifications`, {
        headers: authHeaders
      });

      check(getNotificationsRes, {
        'get notifications successful': (r) => r.status === 200,
      }) || errorRate.add(1);

      // Update profile with large payload
      const updateProfileRes = http.put(`${BASE_URL}/api/profile`, JSON.stringify({
        bio: randomString(500),
        location: randomString(100),
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en',
          timezone: 'UTC',
          customSettings: Array(50).fill(0).map(() => ({
            key: randomString(10),
            value: randomString(20)
          }))
        }
      }), {
        headers: authHeaders
      });

      check(updateProfileRes, {
        'update profile successful': (r) => r.status === 200,
      }) || errorRate.add(1);
    } else {
      errorRate.add(1);
    }
  });

  sleep(1);
}
