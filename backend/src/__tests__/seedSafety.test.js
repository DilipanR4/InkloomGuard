const { randomBytes } = require('crypto');
const { validateSeedEnvironment } = require('../utils/seedSafety');

const makeEnv = overrides => ({
  NODE_ENV: 'development',
  MONGO_URI: 'mongodb://127.0.0.1:27017/inkloom_dev',
  SEED_MODE: 'destructive',
  SEED_CONFIRMATION: 'I_ACCEPT_DESTRUCTIVE_LOCAL_DEV_SEED',
  SEED_CREATOR_PASSWORD: randomBytes(24).toString('hex'),
  SEED_REVIEWER_PASSWORD: randomBytes(24).toString('hex'),
  SEED_MANAGER_PASSWORD: randomBytes(24).toString('hex'),
  ...overrides
});

describe('development seed safety policy', () => {
  test('refuses production even when every destructive safeguard is present', () => {
    expect(() => validateSeedEnvironment(makeEnv({ NODE_ENV: 'production' })))
      .toThrow('Destructive seeding is disabled in production.');
  });

  test('requires both destructive mode and the exact confirmation phrase', () => {
    expect(() => validateSeedEnvironment(makeEnv({ SEED_MODE: '' })))
      .toThrow('Set SEED_MODE=destructive');
    expect(() => validateSeedEnvironment(makeEnv({ SEED_CONFIRMATION: '' })))
      .toThrow('destructive seed confirmation is missing or incorrect');
    expect(() => validateSeedEnvironment(makeEnv({ ALLOW_DEMO_SEED: 'true', SEED_MODE: '', SEED_CONFIRMATION: '' })))
      .toThrow('Set SEED_MODE=destructive');
  });

  test('refuses remote, multi-host, and non-development database targets', () => {
    expect(() => validateSeedEnvironment(makeEnv({ MONGO_URI: 'mongodb://db.example:27017/inkloom_dev' })))
      .toThrow('single local MongoDB instance');
    expect(() => validateSeedEnvironment(makeEnv({ MONGO_URI: 'mongodb://localhost:27017,db.example:27017/inkloom_dev' })))
      .toThrow('MONGO_URI must identify the local development database');
    expect(() => validateSeedEnvironment(makeEnv({ MONGO_URI: 'mongodb://127.0.0.1:27017/inkloom_prod' })))
      .toThrow('restricted to the inkloom_dev database');
    expect(() => validateSeedEnvironment(makeEnv({ MONGO_URI: 'mongodb://127.0.0.1:27017/inkloom_dev?dbName=inkloom_prod' })))
      .toThrow('restricted to the inkloom_dev database');
    expect(() => validateSeedEnvironment(makeEnv({ MONGO_URI: 'mongodb://127.0.0.1:27017/inkloom_dev?dbname=inkloom_prod' })))
      .toThrow('restricted to the inkloom_dev database');
  });

  test('rejects missing connection or demo account credentials', () => {
    expect(() => validateSeedEnvironment(makeEnv({ MONGO_URI: '' })))
      .toThrow('MONGO_URI is required');
    expect(() => validateSeedEnvironment(makeEnv({ SEED_MANAGER_PASSWORD: '' })))
      .toThrow('Provide three distinct demo passwords');
  });

  test('rejects short or reused demo account passwords', () => {
    const env = makeEnv();
    env.SEED_CREATOR_PASSWORD = 'short';
    expect(() => validateSeedEnvironment(env)).toThrow('Provide three distinct demo passwords');

    env.SEED_CREATOR_PASSWORD = randomBytes(24).toString('hex');
    env.SEED_REVIEWER_PASSWORD = env.SEED_CREATOR_PASSWORD;
    expect(() => validateSeedEnvironment(env)).toThrow('Provide three distinct demo passwords');
  });

  test('accepts explicitly confirmed seeding only for the local development database', () => {
    const config = validateSeedEnvironment(makeEnv());

    expect(config.databaseName).toBe('inkloom_dev');
    expect(config.demoPasswords.creator).toHaveLength(48);
    expect(new Set(Object.values(config.demoPasswords)).size).toBe(3);
  });
});
