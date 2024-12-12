const request = require('supertest');
const app = require('../src/app'); // Assuming app.js is where your Express app is defined
const { sequelize } = require('../src/models');
const User = require('../src/models/User');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Recreate the database schema
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/auth/register', () => { 
  it('should register a new user with valid data', async () => {
    console.log('Testing valid registration');
    const response = await request(app)
      .post('/api/auth/register') 
      .send({
        email: 'testuser@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

    console.log('Response:', response.body);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toMatchObject({
      email: 'testuser@example.com',
      firstName: 'Test',
      lastName: 'User'
    });
  });

  it('should not register a user with missing fields', async () => {
    console.log('Testing registration with missing fields');
    const response = await request(app)
      .post('/api/auth/register') 
      .send({
        email: 'testuser2@example.com'
      });

    console.log('Response:', response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'All fields are required');
  });

  it('should not register a user with an invalid email', async () => {
    console.log('Testing registration with invalid email');
    const response = await request(app)
      .post('/api/auth/register') 
      .send({
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

    console.log('Response:', response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Invalid email format');
  });

  it('should not register a user with a weak password', async () => {
    console.log('Testing registration with weak password');
    const response = await request(app)
      .post('/api/auth/register') 
      .send({
        email: 'testuser3@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User'
      });

    console.log('Response:', response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Invalid password format');
  });

  it('should not register a user with an already registered email', async () => {
    console.log('Testing registration with duplicate email');
    // First registration
    await request(app)
      .post('/api/auth/register') 
      .send({
        email: 'duplicate@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

    // Attempt to register again with the same email
    const response = await request(app)
      .post('/api/auth/register') 
      .send({
        email: 'duplicate@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

    console.log('Response:', response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors', expect.arrayContaining([expect.objectContaining({ msg: 'Email already exists' })]));
  });
});
