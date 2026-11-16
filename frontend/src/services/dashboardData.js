const ANALYTICS_ROLES = ['reviewer', 'manager'];

export async function loadDashboardData(api, role) {
  const requests = [Promise.resolve().then(() => api.get('/content?limit=6'))];
  if (ANALYTICS_ROLES.includes(role)) {
    requests.push(Promise.resolve().then(() => api.get('/analytics/overview')));
  }

  const [contentResult, analyticsResult] = await Promise.allSettled(requests);
  if (contentResult.status === 'rejected') throw contentResult.reason;

  if (analyticsResult?.status === 'rejected') {
    console.error('Failed to load dashboard analytics', analyticsResult.reason);
  }

  return {
    stats: analyticsResult?.status === 'fulfilled' ? analyticsResult.value?.data?.stats || null : null,
    submissions: contentResult.value.data?.contents || []
  };
}
