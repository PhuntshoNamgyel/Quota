// tests/api.test.ts
import request from 'supertest';
import '../src/config/seed'; // reseed to a known state before the endpoint tests run
import app from '../src/app';

describe('Auth & access control', () => {
  it('logs in a valid user (FR01)', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'lecturer.cst@rub.edu.bt', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('lecturer');
  });

  it('rejects a wrong password (NFR03)', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'lecturer.cst@rub.edu.bt', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('blocks a protected route with no token (NFR03)', async () => {
    const res = await request(app).get('/api/student/modules');
    expect(res.status).toBe(401);
  });

  it('returns the dashboard for an authenticated student (FR17)', async () => {
    const login = await request(app).post('/api/auth/login')
      .send({ email: '02240337.cst@rub.edu.bt', password: 'password123' });
    const res = await request(app).get('/api/student/modules')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});