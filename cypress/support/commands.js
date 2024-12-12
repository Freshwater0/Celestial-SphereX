// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', (email, password) => {
  return cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password },
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    return response;
  });
});

Cypress.Commands.add('register', (userData) => {
  return cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: userData,
  });
});

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
});

Cypress.Commands.add('createTestUser', (userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
  };
  return cy.register({ ...defaultUser, ...userData });
});
