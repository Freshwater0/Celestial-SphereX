describe('API Integration Tests', () => {
  let authToken;

  before(() => {
    cy.request('POST', '/test/reset-db');
    cy.createTestUser().then((response) => {
      authToken = response.body.token;
    });
  });

  describe('Health Check and Metrics', () => {
    it('should return health status', () => {
      cy.request('/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'healthy');
        expect(response.body).to.have.property('uptime');
      });
    });

    it('should return metrics', () => {
      cy.request('/metrics').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('totalRequests');
        expect(response.body).to.have.property('errorRate');
      });
    });
  });

  describe('Profile Management', () => {
    it('should update user profile', () => {
      const profileData = {
        bio: 'Test bio',
        location: 'Test City',
        timezone: 'UTC',
      };

      cy.request({
        method: 'PUT',
        url: '/api/profile',
        headers: { Authorization: `Bearer ${authToken}` },
        body: profileData,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.profile).to.include(profileData);
      });
    });

    it('should get user profile', () => {
      cy.request({
        method: 'GET',
        url: '/api/profile',
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.profile).to.have.property('bio');
        expect(response.body.profile).to.have.property('location');
      });
    });
  });

  describe('Notifications', () => {
    it('should create notification', () => {
      const notification = {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
      };

      cy.request({
        method: 'POST',
        url: '/api/notifications',
        headers: { Authorization: `Bearer ${authToken}` },
        body: notification,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.notification).to.include(notification);
      });
    });

    it('should list notifications', () => {
      cy.request({
        method: 'GET',
        url: '/api/notifications',
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.notifications).to.be.an('array');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', () => {
      cy.request({
        method: 'GET',
        url: '/api/nonexistent',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error');
      });
    });

    it('should handle validation errors', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/register',
        body: {
          username: 'a', // Too short
          email: 'invalid-email',
          password: '123', // Too short
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('errors');
      });
    });
  });
});
