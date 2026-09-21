const request = require('supertest');
const app = require('../../../server');
const pool = require('../../../config/db');
const bcrypt = require('bcrypt');

jest.mock('../../../config/db', () => ({
  query: jest.fn()
}));

// Mock bcrypt to avoid slow hashing during tests
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('Auth Module API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Test User', email: 'test@example.com', role: 'customer' }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('id', 1);
    });

    it('should return 400 if email exists', async () => {
      pool.query.mockRejectedValueOnce({ code: '23505' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Existing',
          email: 'exists@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Test User', email: 'test@example.com', password_hash: 'hashed_password', role: 'customer' }]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid credentials', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Test User', email: 'test@example.com', password_hash: 'hashed_password', role: 'customer' }]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});
