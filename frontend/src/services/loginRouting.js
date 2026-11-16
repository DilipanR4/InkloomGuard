export function resolveLoginRoute({ isAuthenticated, loading }) {
  if (loading) return 'loading';
  return isAuthenticated ? 'dashboard' : 'login';
}
