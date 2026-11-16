import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import { resolveLoginRoute } from './services/loginRouting';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ContentListPage from './pages/ContentListPage';
import ContentSubmissionPage from './pages/ContentSubmissionPage';
import ContentReviewStudioPage from './pages/ContentReviewStudioPage';
import VersionHistoryPage from './pages/VersionHistoryPage';
import BrandKnowledgePage from './pages/BrandKnowledgePage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditLogsPage from './pages/AuditLogsPage';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root URL displays Public Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/overview" element={<LandingPage />} />

      {/* Auth Entry Routes */}
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />
      {/* Direct Auth Routes */}
      <Route path="/portal/login" element={<LoginRoute />} />
      <Route path="/portal/register" element={<RegisterPage />} />

      {/* Protected Application Routes */}
      <Route element={<AppLayout requireAuth={true} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/content" element={<ContentListPage />} />
        <Route path="/content/new" element={<RoleRoute roles={['creator', 'manager']}><ContentSubmissionPage /></RoleRoute>} />
        <Route path="/content/:id" element={<ContentReviewStudioPage />} />
        <Route path="/content/:id/compare" element={<VersionHistoryPage />} />
        <Route path="/guidelines" element={<BrandKnowledgePage />} />
        <Route path="/analytics" element={<RoleRoute roles={['reviewer', 'manager']}><AnalyticsPage /></RoleRoute>} />
        <Route path="/audit" element={<RoleRoute roles={['manager']}><AuditLogsPage /></RoleRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();
  const route = resolveLoginRoute({ isAuthenticated, loading });

  if (route === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500" role="status">Checking session…</div>;
  }

  return route === 'dashboard' ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

function RoleRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return roles.includes(user?.role) ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
