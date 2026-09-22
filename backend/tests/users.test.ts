import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prisma';

const createUserAndLogin = async (email: string, password = 'password123', role = 'USER') => {
  await request(app).post('/api/auth/register').send({ email, password, role });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { token: res.body.token as string, user: res.body.user };
};

beforeEach(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/users', () => {
  it('admin can get all users', async () => {
    const admin = await createUserAndLogin('admin@example.com', 'password123', 'ADMIN');
    await createUserAndLogin('user1@example.com');
    await createUserAndLogin('user2@example.com');

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(3);
    // Password should never be in the response
    res.body.users.forEach((u: any) => {
      expect(u).not.toHaveProperty('password');
    });
  });

  it('regular user cannot access user list', async () => {
    const { token } = await createUserAndLogin('normaluser@example.com');

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  it('unauthenticated request returns 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/users/:id', () => {
  it('admin can get a user by ID', async () => {
    const admin = await createUserAndLogin('admin2@example.com', 'password123', 'ADMIN');
    const { user } = await createUserAndLogin('target@example.com');

    const res = await request(app)
      .get(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('target@example.com');
  });

  it('returns 404 for non-existent user', async () => {
    const admin = await createUserAndLogin('admin3@example.com', 'password123', 'ADMIN');

    const res = await request(app)
      .get('/api/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/users/:id', () => {
  it('admin can delete another user', async () => {
    const admin = await createUserAndLogin('admin4@example.com', 'password123', 'ADMIN');
    const { user } = await createUserAndLogin('victim@example.com');

    const res = await request(app)
      .delete(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('deleted');
  });

  it('admin cannot delete themselves', async () => {
    const admin = await createUserAndLogin('selfdelete@example.com', 'password123', 'ADMIN');

    const res = await request(app)
      .delete(`/api/users/${admin.user.id}`)
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(400);
  });
});
