import assert from 'node:assert/strict';
import test from 'node:test';
import { loadDashboardData } from '../src/services/dashboardData.js';
import { resolveLoginRoute } from '../src/services/loginRouting.js';

test('creator dashboard loads content without requesting restricted analytics', async () => {
  const calls = [];
  const api = {
    get: async (url) => {
      calls.push(url);
      return { data: { contents: [{ _id: 'content-1' }] } };
    }
  };

  const result = await loadDashboardData(api, 'creator');

  assert.deepEqual(calls, ['/content?limit=6']);
  assert.deepEqual(result.submissions, [{ _id: 'content-1' }]);
  assert.equal(result.stats, null);
});

test('an analytics 403 does not block authorized users’ content list', async () => {
  for (const role of ['reviewer', 'manager']) {
    const calls = [];
    const api = {
      get: async (url) => {
        calls.push(url);
        if (url === '/analytics/overview') throw { response: { status: 403 } };
        return { data: { contents: [{ _id: role }] } };
      }
    };
    const originalError = console.error;
    console.error = () => {};
    try {
      const result = await loadDashboardData(api, role);
      assert.deepEqual(calls, ['/content?limit=6', '/analytics/overview']);
      assert.deepEqual(result.submissions, [{ _id: role }]);
      assert.equal(result.stats, null);
    } finally {
      console.error = originalError;
    }
  }
});

test('login route waits for session verification before redirecting', () => {
  assert.equal(resolveLoginRoute({ loading: true, isAuthenticated: true }), 'loading');
  assert.equal(resolveLoginRoute({ loading: false, isAuthenticated: true }), 'dashboard');
  assert.equal(resolveLoginRoute({ loading: false, isAuthenticated: false }), 'login');
});
