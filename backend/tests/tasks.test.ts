import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prisma';

// Helper: register a user and return their token
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

describe('POST /api/tasks', () => {
  it('should create a task for authenticated user', async () => {
    const { token } = await createUserAndLogin('user@example.com');

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Task', description: 'Some description' });

    expect(res.statusCode).toBe(201);
    expect(res.body.task.title).toBe('My Task');
    expect(res.body.task.status).toBe('PENDING');
  });

  it('should return 422 if title is missing', async () => {
    const { token } = await createUserAndLogin('user2@example.com');

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No title' });

    expect(res.statusCode).toBe(422);
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Task' });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/tasks', () => {
  it('user should see only their own tasks', async () => {
    const userA = await createUserAndLogin('a@example.com');
    const userB = await createUserAndLogin('b@example.com');

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ title: 'Task A' });

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ title: 'Task B' });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe('Task A');
  });

  it('admin should see all tasks', async () => {
    const admin = await createUserAndLogin('admin@example.com', 'password123', 'ADMIN');
    const user = await createUserAndLogin('user@example.com');

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'User Task' });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThanOrEqual(1);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('user can update their own task', async () => {
    const { token } = await createUserAndLogin('editor@example.com');
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Old Title' });

    const taskId = createRes.body.task.id;
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Title', status: 'COMPLETED' });

    expect(res.statusCode).toBe(200);
    expect(res.body.task.title).toBe('New Title');
    expect(res.body.task.status).toBe('COMPLETED');
  });

  it("user cannot update another user's task", async () => {
    const userA = await createUserAndLogin('ownera@example.com');
    const userB = await createUserAndLogin('ownerb@example.com');

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ title: "A's Task" });

    const taskId = createRes.body.task.id;

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ title: 'Hijacked' });

    expect(res.statusCode).toBe(403);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('user can delete their own task', async () => {
    const { token } = await createUserAndLogin('deleter@example.com');
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Delete' });

    const taskId = createRes.body.task.id;
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('deleted');
  });

  it('admin can delete any user task', async () => {
    const admin = await createUserAndLogin('admin_del@example.com', 'password123', 'ADMIN');
    const user = await createUserAndLogin('user_del@example.com');

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Task to be deleted by admin' });

    const taskId = createRes.body.task.id;
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('deleted');
  });
});

describe('GET /api/tasks/:id', () => {
  it('user can view their own task', async () => {
    const user = await createUserAndLogin('view_own@example.com');
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Viewable Task' });

    const taskId = createRes.body.task.id;
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.task.id).toBe(taskId);
  });

  it("user cannot view another user's task", async () => {
    const userA = await createUserAndLogin('user_a@example.com');
    const userB = await createUserAndLogin('user_b@example.com');

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ title: "Private Task" });

    const taskId = createRes.body.task.id;
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(res.statusCode).toBe(403);
  });
});

describe('GET /api/tasks?status=...', () => {
  it('should filter tasks by status', async () => {
    const user = await createUserAndLogin('filter_user@example.com');

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Pending Task', status: 'PENDING' });

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Done Task', status: 'COMPLETED' });

    const res = await request(app)
      .get('/api/tasks?status=COMPLETED')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe('Done Task');
  });
});

