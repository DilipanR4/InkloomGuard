process.env.AI_SERVICE_URL = 'http://ai-service.test';
process.env.AI_SERVICE_TOKEN = 'test-only-ai-service-token';

jest.mock('axios', () => ({ post: jest.fn() }));
jest.mock('../models/Guideline', () => ({ find: jest.fn() }));
jest.mock('../models/Terminology', () => ({ find: jest.fn() }));
jest.mock('../models/ApprovedFact', () => ({ find: jest.fn() }));

const axios = require('axios');
const Guideline = require('../models/Guideline');
const Terminology = require('../models/Terminology');
const ApprovedFact = require('../models/ApprovedFact');
const { requestAiReview, syncAiKnowledgeBase } = require('../services/aiService');

describe('backend to AI-service review contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Guideline.find.mockResolvedValue([{
      guidelineId: 'GUIDE-001',
      title: 'Brand tone',
      description: 'Use a clear and professional tone.',
      category: 'Brand Tone',
      severity: 'low'
    }]);
    Terminology.find.mockResolvedValue([{
      terminologyId: 'TERM-001',
      preferredTerm: 'FreshPlus',
      prohibitedTerms: ['Fresh+'],
      explanation: 'Use the approved product name.',
      severity: 'high',
      caseSensitive: false
    }]);
    ApprovedFact.find.mockResolvedValue([{
      factId: 'FACT-001',
      statement: 'FreshPlus is a fruit beverage.',
      sourceDoc: 'Approved product specification',
      category: 'Ingredients'
    }]);
  });

  test('uses deterministic fallback for a mocked upstream 400 response', async () => {
    const upstreamError = Object.assign(new Error('Request failed with status code 400'), {
      response: { status: 400, data: { detail: 'Bad Request' } }
    });
    axios.post.mockRejectedValueOnce(upstreamError);
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await requestAiReview({
      contentId: 'content-test-1',
      versionNumber: 3,
      text: 'FreshPlus is a refreshing fruit beverage.',
      contentType: 'Social Media Post'
    });

    expect(axios.post).toHaveBeenCalledWith('http://ai-service.test/v1/review', {
      content_id: 'content-test-1',
      version_number: 3,
      submitted_text: 'FreshPlus is a refreshing fruit beverage.',
      content_type: 'Social Media Post',
      knowledge: {
        guidelines: [{
          id: 'GUIDE-001',
          title: 'Brand tone',
          text: 'Use a clear and professional tone.',
          category: 'Brand Tone',
          severity: 'low'
        }],
        terminology: [{
          id: 'TERM-001',
          preferred_term: 'FreshPlus',
          prohibited_terms: ['Fresh+'],
          explanation: 'Use the approved product name.',
          severity: 'high',
          case_sensitive: false
        }],
        facts: [{
          id: 'FACT-001',
          statement: 'FreshPlus is a fruit beverage.',
          source: 'Approved product specification',
          category: 'Ingredients'
        }]
      }
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AI_SERVICE_TOKEN}`
      }
    });
    expect(result.content_id).toBe('content-test-1');
    expect(result.version_number).toBe(3);
    expect(result.processing_metadata.engine).toBe('deterministic_fallback');
    expect(errorLog).toHaveBeenCalled();
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(process.env.AI_SERVICE_TOKEN);
    errorLog.mockRestore();
  });

  test('forwards the service credential when indexing knowledge', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true, chunks_count: 2 } });

    const result = await syncAiKnowledgeBase();

    expect(axios.post).toHaveBeenCalledWith('http://ai-service.test/v1/index', expect.any(Object), {
      timeout: 10000,
      headers: { Authorization: `Bearer ${process.env.AI_SERVICE_TOKEN}` }
    });
    expect(result.success).toBe(true);
  });

  test('does not send an unauthenticated review request when service configuration is missing', async () => {
    const token = process.env.AI_SERVICE_TOKEN;
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    delete process.env.AI_SERVICE_TOKEN;

    try {
      const result = await requestAiReview({
        contentId: 'content-test-no-token',
        versionNumber: 1,
        text: 'FreshPlus is a refreshing fruit beverage.'
      });

      expect(axios.post).not.toHaveBeenCalled();
      expect(result.processing_metadata.engine).toBe('deterministic_fallback');
      expect(JSON.stringify(errorLog.mock.calls)).not.toContain('test-only-ai-service-token');
    } finally {
      process.env.AI_SERVICE_TOKEN = token;
      errorLog.mockRestore();
    }
  });

  test('does not send an unauthenticated indexing request when service configuration is missing', async () => {
    const token = process.env.AI_SERVICE_TOKEN;
    const warningLog = jest.spyOn(console, 'warn').mockImplementation(() => {});
    delete process.env.AI_SERVICE_TOKEN;

    try {
      const result = await syncAiKnowledgeBase();

      expect(axios.post).not.toHaveBeenCalled();
      expect(result).toBeNull();
      expect(JSON.stringify(warningLog.mock.calls)).not.toContain('test-only-ai-service-token');
    } finally {
      process.env.AI_SERVICE_TOKEN = token;
      warningLog.mockRestore();
    }
  });

  test('production backend startup fails clearly when the shared service credential is missing', () => {
    const previous = {
      nodeEnv: process.env.NODE_ENV,
      jwtSecret: process.env.JWT_SECRET,
      mongoUri: process.env.MONGO_URI,
      aiServiceToken: process.env.AI_SERVICE_TOKEN
    };
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'unit-test-jwt-secret';
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/test-only';
    process.env.AI_SERVICE_TOKEN = '';

    try {
      expect(() => require('../server')).toThrow(/AI_SERVICE_TOKEN is required when NODE_ENV=production/);
    } finally {
      process.env.NODE_ENV = previous.nodeEnv;
      process.env.JWT_SECRET = previous.jwtSecret;
      process.env.MONGO_URI = previous.mongoUri;
      process.env.AI_SERVICE_TOKEN = previous.aiServiceToken;
    }
  });

  test('production backend startup rejects a missing AI service URL instead of falling back to localhost', () => {
    const previous = {
      nodeEnv: process.env.NODE_ENV,
      jwtSecret: process.env.JWT_SECRET,
      mongoUri: process.env.MONGO_URI,
      aiServiceToken: process.env.AI_SERVICE_TOKEN,
      aiServiceUrl: process.env.AI_SERVICE_URL
    };
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'unit-test-jwt-secret';
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/test-only';
    process.env.AI_SERVICE_TOKEN = 'unit-test-ai-service-token';
    process.env.AI_SERVICE_URL = '';

    try {
      delete require.cache[require.resolve('../server')];
      expect(() => require('../server')).toThrow(/AI_SERVICE_URL must be an absolute URL/);
    } finally {
      process.env.NODE_ENV = previous.nodeEnv;
      process.env.JWT_SECRET = previous.jwtSecret;
      process.env.MONGO_URI = previous.mongoUri;
      process.env.AI_SERVICE_TOKEN = previous.aiServiceToken;
      process.env.AI_SERVICE_URL = previous.aiServiceUrl;
      delete require.cache[require.resolve('../server')];
    }
  });

  test('production backend startup rejects a localhost AI service URL', () => {
    const previous = {
      nodeEnv: process.env.NODE_ENV,
      jwtSecret: process.env.JWT_SECRET,
      mongoUri: process.env.MONGO_URI,
      aiServiceToken: process.env.AI_SERVICE_TOKEN,
      aiServiceUrl: process.env.AI_SERVICE_URL
    };
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'unit-test-jwt-secret';
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/test-only';
    process.env.AI_SERVICE_TOKEN = 'unit-test-ai-service-token';
    process.env.AI_SERVICE_URL = 'http://localhost:8000';

    try {
      delete require.cache[require.resolve('../server')];
      expect(() => require('../server')).toThrow(/AI_SERVICE_URL must point to the deployed AI service/);
    } finally {
      process.env.NODE_ENV = previous.nodeEnv;
      process.env.JWT_SECRET = previous.jwtSecret;
      process.env.MONGO_URI = previous.mongoUri;
      process.env.AI_SERVICE_TOKEN = previous.aiServiceToken;
      process.env.AI_SERVICE_URL = previous.aiServiceUrl;
      delete require.cache[require.resolve('../server')];
    }
  });
});
