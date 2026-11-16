import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { DEMO_USERS } from '../services/demoData';

const AuthContext = createContext(null);
const VALID_ROLES = ['creator', 'reviewer', 'manager'];

export const AuthProvider = ({ children }) => {
  // Session type: 'real' | 'demo' | null
  const [sessionType, setSessionType] = useState(() => {
    const storedType = localStorage.getItem('inkloom_session_type');
    if (storedType === 'real') return 'real';
    if (storedType === 'demo') {
      if (localStorage.getItem('inkloom_demo_logged_out') === 'true') return null;
      return 'demo';
    }

    // Fallback checks
    const token = localStorage.getItem('inkloom_token');
    if (token && token !== 'public-demo-token') return 'real';
    if (localStorage.getItem('inkloom_demo_role') && localStorage.getItem('inkloom_demo_logged_out') !== 'true') {
      return 'demo';
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    const storedType = localStorage.getItem('inkloom_session_type');
    if (storedType === 'real') {
      const saved = localStorage.getItem('inkloom_user');
      try {
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    }
    if (storedType === 'demo') {
      if (localStorage.getItem('inkloom_demo_logged_out') === 'true') return null;
      const savedRole = localStorage.getItem('inkloom_demo_role');
      return savedRole && DEMO_USERS[savedRole] ? DEMO_USERS[savedRole] : null;
    }

    // Fallbacks if inkloom_session_type is not yet set
    const token = localStorage.getItem('inkloom_token');
    const savedUser = localStorage.getItem('inkloom_user');
    if (token && token !== 'public-demo-token' && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    const savedRole = localStorage.getItem('inkloom_demo_role');
    if (savedRole && localStorage.getItem('inkloom_demo_logged_out') !== 'true') {
      return DEMO_USERS[savedRole] || null;
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    const storedType = localStorage.getItem('inkloom_session_type');
    if (storedType === 'real') {
      return localStorage.getItem('inkloom_token') || null;
    }
    if (storedType === 'demo') {
      if (localStorage.getItem('inkloom_demo_logged_out') === 'true') return null;
      return localStorage.getItem('inkloom_demo_role') ? 'public-demo-token' : null;
    }

    const storedToken = localStorage.getItem('inkloom_token');
    if (storedToken && storedToken !== 'public-demo-token') return storedToken;
    if (localStorage.getItem('inkloom_demo_role') && localStorage.getItem('inkloom_demo_logged_out') !== 'true') {
      return 'public-demo-token';
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    const currentType = sessionType || localStorage.getItem('inkloom_session_type');
    const currentToken = token || localStorage.getItem('inkloom_token');

    if (currentType === 'real' && currentToken && currentToken !== 'public-demo-token') {
      const verifyUser = async () => {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && VALID_ROLES.includes(res.data.user?.role)) {
            setUser(res.data.user);
            localStorage.setItem('inkloom_user', JSON.stringify(res.data.user));
            localStorage.setItem('inkloom_session_type', 'real');
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[Real Auth Session Expired or Invalid]', err.message);
          logout();
        } finally {
          setLoading(false);
        }
      };
      verifyUser();
    } else {
      setLoading(false);
    }
  }, [token, sessionType]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('inkloom:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('inkloom:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    // A failed real login must never leave an old demo or real session active.
    logout();
    const res = await api.post('/auth/login', { email, password });

    if (!res.data?.success || !res.data.token || !VALID_ROLES.includes(res.data.user?.role)) {
      throw new Error(res.data?.message || 'Login failed. Invalid response from server.');
    }

    const { token: jwtToken, user: userData } = res.data;

    if (!userData.role) {
      throw new Error('Authenticated user profile is missing a valid role.');
    }

    // Store explicit real session
    localStorage.setItem('inkloom_session_type', 'real');
    localStorage.setItem('inkloom_token', jwtToken);
    localStorage.setItem('inkloom_user', JSON.stringify(userData));

    // Clear any conflicting demo state
    localStorage.removeItem('inkloom_demo_role');
    localStorage.removeItem('inkloom_demo_logged_out');

    setSessionType('real');
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    // REAL USER REGISTRATION - ALWAYS created in backend database
    const res = await api.post('/auth/register', formData);

    if (!res.data || !res.data.success || !res.data.user) {
      throw new Error(res.data?.message || 'Registration failed. Invalid response from server.');
    }

    const { token: jwtToken, user: newUser } = res.data;

    if (!newUser.role) {
      throw new Error('Registered user profile is missing a valid role.');
    }

    // Store explicit real session
    localStorage.setItem('inkloom_session_type', 'real');
    localStorage.setItem('inkloom_token', jwtToken);
    localStorage.setItem('inkloom_user', JSON.stringify(newUser));

    // Clear any conflicting demo state
    localStorage.removeItem('inkloom_demo_role');
    localStorage.removeItem('inkloom_demo_logged_out');

    setSessionType('real');
    setToken(jwtToken);
    setUser(newUser);
    return newUser;
  };

  const switchDemoRole = async (targetRole) => {
    // DEMO USER SESSION - Explicit demo exploration
    if (!VALID_ROLES.includes(targetRole) || !DEMO_USERS[targetRole]) {
      throw new Error('Select a valid demo role.');
    }
    const role = targetRole;
    const selected = DEMO_USERS[role];

    localStorage.setItem('inkloom_session_type', 'demo');
    localStorage.setItem('inkloom_demo_role', role);
    localStorage.setItem('inkloom_token', 'public-demo-token');
    localStorage.setItem('inkloom_user', JSON.stringify(selected));
    localStorage.removeItem('inkloom_demo_logged_out');

    setSessionType('demo');
    setToken('public-demo-token');
    setUser(selected);
    return selected;
  };

  const logout = () => {
    localStorage.setItem('inkloom_demo_logged_out', 'true');
    localStorage.removeItem('inkloom_demo_role');
    localStorage.removeItem('inkloom_session_type');
    localStorage.removeItem('inkloom_token');
    localStorage.removeItem('inkloom_user');
    localStorage.removeItem('inkloom_onboarding_status');

    setSessionType(null);
    setToken(null);
    setUser(null);
  };

  const updateOnboarding = async ({ completed, skipped, version = 1 }) => {
    const payload = { completed, skipped, version };

    // Persist locally for immediate offline/demo resilience
    localStorage.setItem('inkloom_onboarding_status', JSON.stringify(payload));

    const isDemo = sessionType === 'demo' || token === 'public-demo-token';

    if (isDemo) {
      const currentRole = user?.role;
      if (!VALID_ROLES.includes(currentRole)) return payload;
      DEMO_USERS[currentRole].onboarding = {
        completed: completed !== undefined ? completed : DEMO_USERS[currentRole].onboarding?.completed || false,
        skipped: skipped !== undefined ? skipped : DEMO_USERS[currentRole].onboarding?.skipped || false,
        version: version || 1
      };
      setUser((prev) => ({
        ...prev,
        onboarding: {
          completed: completed !== undefined ? completed : prev?.onboarding?.completed || false,
          skipped: skipped !== undefined ? skipped : prev?.onboarding?.skipped || false,
          version: version || 1
        }
      }));
      return payload;
    }

    try {
      const res = await api.patch('/auth/onboarding', payload);
      if (res.data?.user || res.data?.onboarding) {
        setUser((prev) => ({
          ...prev,
          onboarding: res.data.onboarding || res.data.user.onboarding
        }));
      }
      return res.data;
    } catch (err) {
      console.warn('[Onboarding Update Warning]', err.message);
      return payload;
    }
  };

  const startTour = () => setTourOpen(true);
  const closeTour = () => setTourOpen(false);

  const isDemoSession = sessionType === 'demo' || token === 'public-demo-token';
  const isRealSession = sessionType === 'real' || (Boolean(token) && token !== 'public-demo-token');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        sessionType,
        isDemoSession,
        isRealSession,
        isAuthenticated: Boolean(user && token && VALID_ROLES.includes(user.role)),
        isDemoMode: isDemoSession,
        login,
        register,
        logout,
        switchDemoRole,
        tourOpen,
        startTour,
        closeTour,
        updateOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
