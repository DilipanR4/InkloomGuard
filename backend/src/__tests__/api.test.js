const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

function requireTestPassword(name) {
  const password = process.env[name];
  if (!password) {
    throw new Error(`${name} is required for isolated database-backed tests.`);
  }
  return password;
}
const testPasswords = {
  creator: requireTestPassword('TEST_CREATOR_PASSWORD'),
  reviewer: requireTestPassword('TEST_REVIEWER_PASSWORD'),
  manager: requireTestPassword('TEST_MANAGER_PASSWORD'),
};

let creatorToken;
let reviewerToken;
let managerToken;

beforeAll(async () => {
  // Connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inkloom');
  }

  // Login as creator
  const creatorRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'creator@freshplus.io', password: testPasswords.creator });
  creatorToken = creatorRes.body.token;

  // Login as reviewer
  const reviewerRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'reviewer@freshplus.io', password: testPasswords.reviewer });
  reviewerToken = reviewerRes.body.token;

  // Login as manager
  const managerRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'manager@freshplus.io', password: testPasswords.manager });
  managerToken = managerRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Inkloom AI - Backend API Tests', () => {
  test('GET /api/health should return platform branding and domain', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.platform).toBe('Inkloom AI');
    expect(res.body.brandIdentity).toBe('InkloomGuard');
    expect(res.body.domain).toBe('https://inkloomguard.xyz');
  });

  test('POST /api/auth/login should return valid JWT for seeded demo accounts', async () => {
    expect(creatorToken).toBeDefined();
    expect(reviewerToken).toBeDefined();
    expect(managerToken).toBeDefined();
  });

  test('Manager-only endpoints reject a creator and allow a manager', async () => {
    const creatorUsers = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${creatorToken}`);
    const creatorAudit = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${creatorToken}`);
    const managerUsers = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(creatorUsers.status).toBe(403);
    expect(creatorAudit.status).toBe(403);
    expect(managerUsers.status).toBe(200);
  });

  test('GET /api/auth/me should return logged-in user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${creatorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('creator');
  });

  test('Creator should be FORBIDDEN from creating brand guidelines (RBAC check)', async () => {
    const res = await request(app)
      .post('/api/guidelines')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        guidelineId: 'GUIDE-999',
        title: 'Unauthorized Rule',
        description: 'Test rule'
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Manager should be ALLOWED to view and manage guidelines', async () => {
    const res = await request(app)
      .get('/api/guidelines')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.guidelines.length).toBeGreaterThan(0);
  });

  test('Creator should be FORBIDDEN from approving content (Human Authority RBAC check)', async () => {
    // Get a content item
    const contentList = await request(app)
      .get('/api/content')
      .set('Authorization', `Bearer ${creatorToken}`);
    const contentId = contentList.body.contents[0]._id;

    const res = await request(app)
      .post(`/api/content/${contentId}/approve`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ comment: 'Creator trying to approve own content' });
    expect(res.status).toBe(403);
  });

  test('Reviewer should be ALLOWED to review and view submissions', async () => {
    const res = await request(app)
      .get('/api/content')
      .set('Authorization', `Bearer ${reviewerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.contents).toBeDefined();
  });

  test('GET /api/analytics/overview should return real aggregated metrics', async () => {
    const res = await request(app)
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.stats.totalSubmissions).toBeGreaterThan(0);
    expect(res.body.stats.totalFindings).toBeGreaterThan(0);
  });

  test('Creator cannot access reviewer and manager analytics endpoints', async () => {
    const res = await request(app)
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(res.status).toBe(403);
  });
});
