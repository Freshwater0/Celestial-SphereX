import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 1000,
      timeUnit: '1s',
      stages: [
        { duration: '1m', target: 10 },    // Below normal load
        { duration: '1m', target: 500 },   // Spike to very high load
        { duration: '3m', target: 500 },   // Stay at spike
        { duration: '1m', target: 10 },    // Scale down to normal load
        { duration: '2m', target: 10 },    // Stay at normal load
        { duration: '1m', target: 0 },     // Scale down to zero
      ],
      gracefulStop: '2m',
    },
  },
  thresholds: {
    http_req_duration: ['p(99)<3000'], // 99% of requests must complete below 3s
    errors: ['rate<0.2'],              // Error rate must be less than 20%
  },
};

const BASE_URL = 'http://localhost:5000';

// Cache for active user sessions
const userSessions = new Map();

function generateUser() {
  const id = Math.floor(Math.random() * 1000000);
  return {
    username: `spike_user_${id}`,
    email: `spike_${id}@example.com`,
    password: 'Password123!'
  };
}

export default function() {
  // Randomly decide whether to use an existing session or create a new one
  let token;
  if (userSessions.size > 0 && Math.random() < 0.7) {
    // 70% chance to reuse an existing session
    const sessions = Array.from(userSessions.values());
    token = sessions[Math.floor(Math.random() * sessions.length)];
  }

  if (!token) {
    // Create new user and session
    const user = generateUser();
    const registerRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' }
    });

    if (check(registerRes, {
      'register successful': (r) => r.status === 201,
    })) {
      token = registerRes.json('token');
      userSessions.set(user.email, token);
      // Limit cache size
      if (userSessions.size > 100) {
        const firstKey = userSessions.keys().next().value;
        userSessions.delete(firstKey);
      }
    } else {
      errorRate.add(1);
      return;
    }
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Simulate heavy concurrent operations
  const requests = {
    'getProfile': {
      method: 'GET',
      url: `${BASE_URL}/api/auth/profile`,
      headers: authHeaders
    },
    'getNotifications': {
      method: 'GET',
      url: `${BASE_URL}/api/notifications`,
      headers: authHeaders
    },
    'getMetrics': {
      method: 'GET',
      url: `${BASE_URL}/metrics`,
      headers: authHeaders
    }
  };

  // Send multiple requests in parallel
  const responses = http.batch(requests);

  // Check responses
  for (const [name, response] of Object.entries(responses)) {
    check(response, {
      [`${name} successful`]: (r) => r.status === 200,
    }) || errorRate.add(1);
  }

  // Create some data
  if (Math.random() < 0.3) { // 30% chance to create data
    const createRequests = [
      http.post(`${BASE_URL}/api/notifications`, JSON.stringify({
        title: 'Spike Test',
        message: 'Testing system under spike load'
      }), { headers: authHeaders }),
      http.put(`${BASE_URL}/api/profile`, JSON.stringify({
        bio: 'Updated during spike test',
        location: 'Load Test Location'
      }), { headers: authHeaders })
    ];

    createRequests.forEach((res, index) => {
      check(res, {
        [`create operation ${index} successful`]: (r) => r.status < 400,
      }) || errorRate.add(1);
    });
  }

  sleep(0.1); // Small sleep to prevent overwhelming the system completely
}
