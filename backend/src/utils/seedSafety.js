const DEVELOPMENT_DATABASE = 'inkloom_dev';
const CONFIRMATION_PHRASE = 'I_ACCEPT_DESTRUCTIVE_LOCAL_DEV_SEED';
const PASSWORD_VARIABLES = ['SEED_CREATOR_PASSWORD', 'SEED_REVIEWER_PASSWORD', 'SEED_MANAGER_PASSWORD'];

function validateSeedEnvironment(env) {
  if (env.NODE_ENV === 'production') throw new Error('Destructive seeding is disabled in production.');
  if (env.NODE_ENV !== 'development') throw new Error('Destructive seeding requires NODE_ENV=development.');
  if (env.SEED_MODE !== 'destructive') throw new Error('Set SEED_MODE=destructive to enable local seed cleanup.');
  if (env.SEED_CONFIRMATION !== CONFIRMATION_PHRASE) throw new Error('The destructive seed confirmation is missing or incorrect.');
  if (!env.MONGO_URI?.trim()) throw new Error('MONGO_URI is required for local development seeding.');

  let target;
  try {
    target = new URL(env.MONGO_URI);
  } catch {
    throw new Error('MONGO_URI must identify the local development database.');
  }

  const authority = env.MONGO_URI.match(/^mongodb:\/\/([^/?#]+)/i)?.[1] || '';
  const localHosts = new Set(['127.0.0.1', '[::1]']);
  if (target.protocol !== 'mongodb:' || authority.includes(',') || !localHosts.has(target.hostname)) {
    throw new Error('Destructive seeding is restricted to a single local MongoDB instance.');
  }

  let databaseName;
  try {
    databaseName = decodeURIComponent(target.pathname.slice(1));
  } catch {
    throw new Error('MONGO_URI must identify the local development database.');
  }
  const databaseOverrides = [...target.searchParams]
    .filter(([name]) => name.toLowerCase() === 'dbname')
    .map(([, value]) => value);
  if (databaseName !== DEVELOPMENT_DATABASE || databaseOverrides.some(name => name !== DEVELOPMENT_DATABASE)) {
    throw new Error(`Destructive seeding is restricted to the ${DEVELOPMENT_DATABASE} database.`);
  }

  const passwords = PASSWORD_VARIABLES.map(name => env[name] || '');
  if (passwords.some(password => password.trim().length < 32) || new Set(passwords).size !== passwords.length) {
    throw new Error('Provide three distinct demo passwords of at least 32 characters using the SEED_*_PASSWORD variables.');
  }

  return {
    mongoUri: env.MONGO_URI,
    databaseName,
    demoPasswords: {
      creator: passwords[0],
      reviewer: passwords[1],
      manager: passwords[2]
    }
  };
}

module.exports = { validateSeedEnvironment };
