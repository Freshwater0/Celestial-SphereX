// Mock services to simulate backend interactions

export const MockAuthService = {
  login: jest.fn((email, password) => {
    if (email === 'test@example.com' && password === 'password123') {
      return Promise.resolve({
        user: { id: '1', email: 'test@example.com' },
        token: 'mock-auth-token'
      });
    }
    return Promise.reject(new Error('Invalid credentials'));
  }),

  signup: jest.fn((email, password) => {
    if (email && password.length >= 8) {
      return Promise.resolve({
        user: { id: '2', email: email },
        token: 'new-user-token'
      });
    }
    return Promise.reject(new Error('Invalid signup details'));
  }),

  resetPassword: jest.fn((email) => {
    if (email) {
      return Promise.resolve({ message: 'Password reset link sent' });
    }
    return Promise.reject(new Error('Invalid email'));
  })
};

export const MockProfileService = {
  getUserProfile: jest.fn(() => {
    return Promise.resolve({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      preferences: {}
    });
  }),

  updateProfile: jest.fn((profileData) => {
    if (profileData.name) {
      return Promise.resolve({
        ...profileData,
        updatedAt: new Date().toISOString()
      });
    }
    return Promise.reject(new Error('Invalid profile update'));
  })
};

export const MockAnalyticsService = {
  getDashboardMetrics: jest.fn(() => {
    return Promise.resolve({
      totalUsers: 1000,
      activeUsers: 500,
      revenueThisMonth: 50000,
      growthRate: 0.15
    });
  }),

  getDataInsights: jest.fn(() => {
    return Promise.resolve({
      dataPoints: [
        { category: 'Sales', value: 75000 },
        { category: 'Marketing', value: 45000 },
        { category: 'Operations', value: 30000 }
      ]
    });
  })
};

export const MockBillingService = {
  getBillingInfo: jest.fn(() => {
    return Promise.resolve({
      currentPlan: 'Pro',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethods: [
        { type: 'Credit Card', last4: '1234', expiry: '12/25' }
      ]
    });
  }),

  updatePaymentMethod: jest.fn((paymentDetails) => {
    if (paymentDetails.cardNumber) {
      return Promise.resolve({ success: true, message: 'Payment method updated' });
    }
    return Promise.reject(new Error('Invalid payment details'));
  })
};
