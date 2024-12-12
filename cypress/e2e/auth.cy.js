describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.request('POST', '/test/reset-db');
  });

  it('should register a new user', () => {
    const user = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'Password123!',
    };

    cy.register(user).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('token');
      expect(response.body.user).to.have.property('username', user.username);
      expect(response.body.user).to.have.property('email', user.email);
    });
  });

  it('should login an existing user', () => {
    const user = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    cy.createTestUser().then(() => {
      cy.login(user.email, user.password).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
        expect(response.body.user).to.have.property('email', user.email);
      });
    });
  });

  it('should get user profile when authenticated', () => {
    cy.createTestUser().then((registerResponse) => {
      const token = registerResponse.body.token;
      
      cy.request({
        method: 'GET',
        url: '/api/auth/profile',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.user).to.have.property('email', 'test@example.com');
      });
    });
  });

  it('should handle invalid login credentials', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error');
    });
  });

  it('should prevent access to protected routes without token', () => {
    cy.request({
      method: 'GET',
      url: '/api/auth/profile',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error');
    });
  });
});
