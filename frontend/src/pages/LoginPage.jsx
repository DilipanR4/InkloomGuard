import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, UserCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      await switchDemoRole(role);
      navigate('/dashboard');
    } catch (err) {
      setError(`Failed to log in as ${role}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-sm hover:bg-[#4338CA] transition-colors">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-[#14213D] tracking-tight font-sans">InkloomGuard</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#14213D]">
          Sign in to Inkloom AI
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Intelligent Brand Governance Platform • <a href="https://inkloomguard.xyz" className="text-[#4F46E5] hover:underline font-medium">inkloomguard.xyz</a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E2E8F0] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Quick-Credentials Card */}
          <div className="mb-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
            <div className="flex items-center space-x-1.5 text-indigo-900 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-[#4F46E5]" />
              <span>Interactive Demo Quick Sign-In</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-tight">
              Select any demo persona to test role-specific brand governance workflows:
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoLogin('creator')}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-2xs cursor-pointer"
              >
                Priya (Creator)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('reviewer')}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-2xs cursor-pointer"
              >
                Arjun (Reviewer)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager')}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-2xs cursor-pointer"
              >
                Rohan (Manager)
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#14213D]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@freshplus.io"
                className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-[#14213D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14213D]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-[#14213D]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            <span>Return to public page? </span>
            <Link to="/" className="font-semibold text-[#4F46E5] hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
