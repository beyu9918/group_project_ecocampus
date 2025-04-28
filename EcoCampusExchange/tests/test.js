import request from 'supertest';
import app from '../app.js';

describe('EcoCampusExchange API Tests', () => {
  test('GET /search should return 200 OK', async () => {
    const res = await request(app).get('/search');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('EcoCampus'); 
  });
});
