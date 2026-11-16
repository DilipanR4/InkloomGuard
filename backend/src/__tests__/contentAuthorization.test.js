process.env.JWT_SECRET = 'content-route-test-secret';

jest.mock('../models/User', () => ({ findById: jest.fn() }));
jest.mock('../models/Content', () => ({ create: jest.fn(), find: jest.fn(), findOne: jest.fn() }));
jest.mock('../models/ContentVersion', () => ({ create: jest.fn(), find: jest.fn(), findOne: jest.fn() }));
jest.mock('../models/Finding', () => ({
  deleteMany: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  insertMany: jest.fn()
}));
jest.mock('../models/Comment', () => ({ create: jest.fn(), find: jest.fn() }));
jest.mock('../models/AuditLog', () => ({ find: jest.fn() }));
jest.mock('../utils/auditLogger', () => ({ logAudit: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../services/aiService', () => ({
  requestAiReview: jest.fn().mockResolvedValue({ findings: [], governance_score: 90 })
}));

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Content = require('../models/Content');
const ContentVersion = require('../models/ContentVersion');
const Finding = require('../models/Finding');
const Comment = require('../models/Comment');
const AuditLog = require('../models/AuditLog');
const { requestAiReview } = require('../services/aiService');

const contentRoutes = require('../routes/contentRoutes');
const findingRoutes = require('../routes/findingRoutes');

const users = {
  'creator-1': { _id: 'creator-1', role: 'creator' },
  'creator-2': { _id: 'creator-2', role: 'creator' },
  'reviewer-1': { _id: 'reviewer-1', role: 'reviewer' },
  'manager-1': { _id: 'manager-1', role: 'manager' }
};

const makeContent = (id, creator) => {
  const content = {
    _id: id,
    creator,
    currentVersion: 1,
    contentType: 'General Marketing',
    status: 'draft',
    populate: jest.fn(async () => content),
    save: jest.fn(async () => content)
  };
  return content;
};

const tokenFor = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET);
const runRoute = async (router, method, path, userId, { params = {}, body = {}, query = {} } = {}) => {
  const route = router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method]);
  if (!route) throw new Error(`Missing ${method.toUpperCase()} route ${path}`);

  const req = {
    method: method.toUpperCase(),
    headers: { authorization: `Bearer ${tokenFor(userId)}` },
    params,
    body,
    query
  };
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; }
  };

  for (const layer of route.route.stack.filter((item) => item.method === method)) {
    let continued = false;
    let nextError;
    await layer.handle(req, res, (error) => {
      nextError = error;
      continued = !error;
    });
    if (nextError) throw nextError;
    if (!continued) break;
  }

  return res;
};

const callContent = (method, path, userId, params = {}, body = {}, query = {}) => (
  runRoute(contentRoutes, method, path, userId, { params, body, query })
);
const callFinding = (method, path, userId, params = {}, body = {}, query = {}) => (
  runRoute(findingRoutes, method, path, userId, { params, body, query })
);

describe('content object-level authorization (mocked models; no database)', () => {
  let contentRecords;
  let ownedFinding;
  let currentVersion;
  let createdComment;

  beforeEach(() => {
    jest.clearAllMocks();
    contentRecords = {
      'own-content': makeContent('own-content', 'creator-1'),
      'other-content': makeContent('other-content', 'creator-2')
    };
    ownedFinding = {
      _id: 'finding-own',
      contentId: 'own-content',
      decision: 'pending',
      save: jest.fn().mockResolvedValue(undefined)
    };
    currentVersion = {
      _id: 'version-1',
      contentId: 'own-content',
      versionNumber: 1,
      rawText: 'Approved draft text',
      save: jest.fn().mockResolvedValue(undefined)
    };
    createdComment = {
      populate: jest.fn().mockResolvedValue({ comment: 'Comment' })
    };

    User.findById.mockImplementation((id) => ({
      select: jest.fn().mockResolvedValue(users[id] || null)
    }));
    Content.findOne.mockImplementation(async ({ _id, creator }) => {
      const content = contentRecords[String(_id)];
      if (!content || (creator && creator !== content.creator)) return null;
      return content;
    });
    const contentList = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    };
    Content.find.mockReturnValue(contentList);
    Content.create.mockImplementation(async (data) => ({ _id: 'created-content', ...data }));
    ContentVersion.create.mockImplementation(async (data) => ({
      _id: 'version-2',
      ...data,
      save: jest.fn().mockResolvedValue(undefined)
    }));
    ContentVersion.findOne.mockImplementation(async ({ contentId, versionNumber }) => ({
      ...currentVersion,
      contentId,
      versionNumber
    }));
    ContentVersion.find.mockReturnValue({
      select: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
    });
    Finding.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    Finding.findOne.mockImplementation(async ({ _id, contentId }) => (
      _id === ownedFinding._id && contentId === ownedFinding.contentId ? ownedFinding : null
    ));
    Finding.deleteMany.mockResolvedValue({ deletedCount: 0 });
    Finding.insertMany.mockResolvedValue([]);
    Comment.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
    });
    Comment.create.mockResolvedValue(createdComment);
    AuditLog.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
  });

  test('creator cannot read another creator’s detail, findings, history, or versions', async () => {
    const routes = [
      ['/:id', { id: 'other-content' }, {}],
      ['/:id/findings', { id: 'other-content' }, {}],
      ['/:id/history', { id: 'other-content' }, {}],
      ['/:id/compare', { id: 'other-content' }, { v1: '1', v2: '1' }]
    ];

    for (const [path, params, query] of routes) {
      const response = await callContent('get', path, 'creator-1', params, {}, query);
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Content not found');
      expect(JSON.stringify(response.body)).not.toContain('creator-2');
    }

    expect(ContentVersion.findOne).not.toHaveBeenCalled();
    expect(Finding.find).not.toHaveBeenCalled();
    expect(AuditLog.find).not.toHaveBeenCalled();
  });

  test('content list scopes creators to their own records while reviewers and managers see the review workspace', async () => {
    const creatorResponse = await callContent('get', '/', 'creator-1');
    expect(creatorResponse.statusCode).toBe(200);
    expect(Content.find).toHaveBeenLastCalledWith({ creator: 'creator-1' });

    const reviewerResponse = await callContent('get', '/', 'reviewer-1');
    expect(reviewerResponse.statusCode).toBe(200);
    expect(Content.find).toHaveBeenLastCalledWith({});

    const managerResponse = await callContent('get', '/', 'manager-1');
    expect(managerResponse.statusCode).toBe(200);
    expect(Content.find).toHaveBeenLastCalledWith({});
  });

  test('creator cannot trigger a review or delete findings for another creator’s content', async () => {
    const response = await callContent('post', '/:id/review', 'creator-1', { id: 'other-content' });

    expect(response.statusCode).toBe(404);
    expect(Finding.deleteMany).not.toHaveBeenCalled();
    expect(requestAiReview).not.toHaveBeenCalled();
  });

  test('creator cannot submit a revision to another creator’s content', async () => {
    const response = await callContent('post', '/:id/revisions', 'creator-1', { id: 'other-content' }, {
      rawText: 'Tampered text', autoReview: false
    });

    expect(response.statusCode).toBe(404);
    expect(ContentVersion.create).not.toHaveBeenCalled();
  });

  test('reviewer cannot submit revisions despite access to the content', async () => {
    const response = await callContent('post', '/:id/revisions', 'reviewer-1', { id: 'other-content' }, {
      rawText: 'Reviewer edit', autoReview: false
    });

    expect(response.statusCode).toBe(403);
    expect(Content.findOne).not.toHaveBeenCalled();
    expect(ContentVersion.create).not.toHaveBeenCalled();
  });

  test('creator cannot decide a finding on another creator’s content', async () => {
    const response = await callContent(
      'patch',
      '/:id/findings/:findingId/decision',
      'creator-1',
      { id: 'other-content', findingId: 'finding-other' },
      { action: 'accepted' }
    );

    expect(response.statusCode).toBe(404);
    expect(Finding.findOne).not.toHaveBeenCalled();
  });

  test('finding ID must belong to the requested content before a decision is saved', async () => {
    const response = await callContent(
      'patch',
      '/:id/findings/:findingId/decision',
      'creator-1',
      { id: 'own-content', findingId: 'finding-other' },
      { action: 'accepted' }
    );

    expect(response.statusCode).toBe(404);
    expect(Finding.findOne).toHaveBeenCalledWith({ _id: 'finding-other', contentId: 'own-content' });
    expect(ownedFinding.save).not.toHaveBeenCalled();
  });

  test('legacy finding decision route also requires an authorized content ID', async () => {
    const response = await callFinding('patch', '/:id/decision', 'creator-1', { id: 'finding-other' }, {
      contentId: 'other-content', action: 'accepted'
    });

    expect(response.statusCode).toBe(404);
    expect(Finding.findOne).not.toHaveBeenCalled();
  });

  test('legacy finding decision route rejects requests without a content ID', async () => {
    const response = await callFinding('patch', '/:id/decision', 'creator-1', { id: 'finding-own' }, {
      action: 'accepted'
    });

    expect(response.statusCode).toBe(400);
    expect(Finding.findOne).not.toHaveBeenCalled();
  });

  test('creator cannot attach another content’s finding to a comment', async () => {
    const response = await callContent('post', '/:id/comments', 'creator-1', { id: 'own-content' }, {
      comment: 'Cross-content link', findingId: 'finding-other'
    });

    expect(response.statusCode).toBe(404);
    expect(Finding.findOne).toHaveBeenCalledWith({ _id: 'finding-other', contentId: 'own-content' });
    expect(Comment.create).not.toHaveBeenCalled();
  });

  test('creator can read, review, revise, comment on, and decide findings for own content', async () => {
    const detail = await callContent('get', '/:id', 'creator-1', { id: 'own-content' });
    expect(detail.statusCode).toBe(200);

    const findings = await callContent('get', '/:id/findings', 'creator-1', { id: 'own-content' });
    expect(findings.statusCode).toBe(200);
    expect(Finding.find).toHaveBeenCalledWith({ contentId: 'own-content', versionNumber: 1 });

    const review = await callContent('post', '/:id/review', 'creator-1', { id: 'own-content' });
    expect(review.statusCode).toBe(200);
    expect(Finding.deleteMany).toHaveBeenCalledWith({ contentId: 'own-content', versionNumber: 1 });

    const revision = await callContent('post', '/:id/revisions', 'creator-1', { id: 'own-content' }, {
      rawText: 'Creator revision', autoReview: false
    });
    expect(revision.statusCode).toBe(201);

    const comment = await callContent('post', '/:id/comments', 'creator-1', { id: 'own-content' }, {
      comment: 'Creator comment'
    });
    expect(comment.statusCode).toBe(201);

    const decision = await callContent(
      'patch',
      '/:id/findings/:findingId/decision',
      'creator-1',
      { id: 'own-content', findingId: 'finding-own' },
      { action: 'accepted' }
    );
    expect(decision.statusCode).toBe(200);
    expect(ownedFinding.save).toHaveBeenCalledTimes(1);
  });

  test('reviewer can review and approve authorized content, but cannot revise it', async () => {
    const review = await callContent('post', '/:id/review', 'reviewer-1', { id: 'other-content' });
    expect(review.statusCode).toBe(200);

    const changes = await callContent('post', '/:id/request-changes', 'reviewer-1', { id: 'other-content' }, {
      reason: 'Please revise the claim'
    });
    expect(changes.statusCode).toBe(200);

    const approval = await callContent('post', '/:id/approve', 'reviewer-1', { id: 'other-content' }, {
      comment: 'Approved'
    });
    expect(approval.statusCode).toBe(200);
  });

  test('manager can revise another creator’s content', async () => {
    const response = await callContent('post', '/:id/revisions', 'manager-1', { id: 'other-content' }, {
      rawText: 'Manager revision', autoReview: false
    });

    expect(response.statusCode).toBe(201);
    expect(ContentVersion.create).toHaveBeenCalledWith(expect.objectContaining({
      contentId: 'other-content',
      rawText: 'Manager revision',
      submittedBy: 'manager-1'
    }));
  });

  test('reviewers cannot create content while creators and managers can', async () => {
    const denied = await callContent('post', '/', 'reviewer-1', {}, { title: 'Blocked', rawText: 'Copy' });
    expect(denied.statusCode).toBe(403);
    expect(Content.create).not.toHaveBeenCalled();

    for (const userId of ['creator-1', 'manager-1']) {
      const allowed = await callContent('post', '/', userId, {}, { title: 'Allowed', rawText: 'Copy' });
      expect(allowed.statusCode).toBe(201);
    }
    expect(Content.create).toHaveBeenCalledTimes(2);
  });
});
