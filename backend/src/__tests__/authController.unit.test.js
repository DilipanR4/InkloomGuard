process.env.JWT_SECRET = 'inkloom-auth-unit-test-secret';

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn()
}));
jest.mock('../utils/auditLogger', () => ({ logAudit: jest.fn().mockResolvedValue(undefined) }));

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { loginUser, registerUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('Authentication without a database connection', () => {
  beforeEach(() => jest.clearAllMocks());

  test.each(['creator', 'reviewer', 'manager'])('valid %s credentials return a role-matched JWT', async (role) => {
    const user = {
      _id: `id-${role}`,
      name: role,
      email: `${role}@example.test`,
      role,
      matchPassword: jest.fn().mockResolvedValue(true)
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const res = response();

    await loginUser({ body: { email: user.email, password: 'correct-password' } }, res, jest.fn());

    const payload = res.json.mock.calls[0][0];
    expect(res.status).not.toHaveBeenCalled();
    expect(payload.success).toBe(true);
    expect(payload.user.role).toBe(role);
    expect(jwt.verify(payload.token, process.env.JWT_SECRET).id).toBe(user._id);
  });

  test('unknown email and incorrect password are rejected', async () => {
    const resUnknown = response();
    User.findOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValue(null) });
    await loginUser({ body: { email: 'unknown@example.test', password: 'anything' } }, resUnknown, jest.fn());
    expect(resUnknown.status).toHaveBeenCalledWith(401);

    const resWrongPassword = response();
    User.findOne.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ matchPassword: jest.fn().mockResolvedValue(false) })
    });
    await loginUser({ body: { email: 'known@example.test', password: 'wrong' } }, resWrongPassword, jest.fn());
    expect(resWrongPassword.status).toHaveBeenCalledWith(401);
  });

  test('empty credentials are rejected', async () => {
    const res = response();
    await loginUser({ body: { email: '', password: '' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test('registration cannot self-assign reviewer or manager access', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockImplementation(async (data) => ({ _id: 'new-id', ...data }));
    const res = response();

    await registerUser({ body: {
      name: 'New User', email: 'new@example.test', password: 'correct-password', role: 'manager'
    } }, res, jest.fn());

    expect(User.create.mock.calls[0][0].role).toBe('creator');
    expect(res.json.mock.calls[0][0].user.role).toBe('creator');
  });

  test('expired JWT is rejected by protected routes', async () => {
    const token = jwt.sign({ id: 'user-id' }, process.env.JWT_SECRET, { expiresIn: -1 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = response();

    await protect(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('production startup fails clearly without JWT_SECRET', () => {
    const previousMode = process.env.NODE_ENV;
    const previousSecret = process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = '';

    try {
      expect(() => require('../server')).toThrow(/JWT_SECRET is required when NODE_ENV=production/);
    } finally {
      process.env.NODE_ENV = previousMode;
      process.env.JWT_SECRET = previousSecret;
    }
  });

  test('production startup fails clearly without MONGO_URI', () => {
    const previousMode = process.env.NODE_ENV;
    const previousMongoUri = process.env.MONGO_URI;
    process.env.NODE_ENV = 'production';
    process.env.MONGO_URI = '';

    try {
      expect(() => require('../server')).toThrow(/MONGO_URI is required when NODE_ENV=production/);
    } finally {
      process.env.NODE_ENV = previousMode;
      process.env.MONGO_URI = previousMongoUri;
    }
  });
});
