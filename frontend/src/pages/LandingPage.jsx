import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Scale,
  Users2,
  Lock,
  ArrowRight,
  BookOpen,
  Sparkles,
  GitBranch,
  BarChart3,
  LayoutDashboard,
  Check,
  X,
  FileText,
  History,
  Eye,
  Layers,
  ChevronRight,
  Menu,
  Zap,
  SlidersHorizontal,
  Search,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
  Clock
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);

  const handleSelectRole = async (role) => {
    setLoadingRole(role);
    try {
      await switchDemoRole(role);
      setShowDemoModal(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to switch demo role', err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#14213D] selection:bg-[#4F46E5] selection:text-white font-sans antialiased">
      {/* Top Enterprise Banner */}
      <div className="bg-[#14213D] text-slate-300 text-xs py-2 px-4 text-center font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Enterprise Brand Protection • Source-Grounded Brand Governance • Domain:</span>
          <a
            href="https://inkloomguard.xyz"
            className="text-indigo-400 font-semibold underline hover:text-indigo-300"
          >
            inkloomguard.xyz
          </a>
        </div>
      </div>

      {/* Navigation Bar */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
        {/* Brand Logo & Description */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-sm group-hover:bg-[#4338CA] transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#14213D] text-base tracking-tight">InkloomGuard</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                Enterprise AI
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium hidden sm:block">Brand Governance & Compliance</p>
          </div>
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-[#64748B]">
          <a href="#product" className="hover:text-[#14213D] transition-colors py-1">
            Product
          </a>
          <a href="#features" className="hover:text-[#14213D] transition-colors py-1">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[#14213D] transition-colors py-1">
            How It Works
          </a>
          <a href="#governance" className="hover:text-[#14213D] transition-colors py-1">
            Governance
          </a>
        </nav>

        {/* Right Header Controls */}
        <div className="hidden sm:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="text-right text-xs">
                <span className="text-[#64748B]">Welcome back, </span>
                <span className="font-semibold text-[#14213D] capitalize">{user?.name || user?.role}</span>
                <span className="ml-1.5 text-[10px] uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-[#4F46E5] font-bold border border-indigo-200">
                  {user?.role}
                </span>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-semibold hover:bg-[#4338CA] shadow-sm transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-2 rounded-xl text-[#64748B] hover:text-[#14213D] hover:bg-[#F5F7FB] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold px-3.5 py-2 rounded-xl text-[#14213D] bg-white border border-[#E2E8F0] hover:bg-[#F5F7FB] hover:border-slate-300 shadow-2xs transition-all"
              >
                Sign Up
              </Link>
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-semibold hover:bg-[#4338CA] shadow-sm transition-all cursor-pointer"
              >
                <span>Explore Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center space-x-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#14213D] hover:bg-[#F5F7FB]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-[#E2E8F0] px-4 pt-3 pb-5 space-y-2">
          <a
            href="#product"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-semibold text-[#64748B] hover:text-[#14213D]"
          >
            Product
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-semibold text-[#64748B] hover:text-[#14213D]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-semibold text-[#64748B] hover:text-[#14213D]"
          >
            How It Works
          </a>
          <a
            href="#governance"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-xs font-semibold text-[#64748B] hover:text-[#14213D]"
          >
            Governance
          </a>
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col space-y-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-semibold"
              >
                Return to Dashboard ({user?.role})
              </Link>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#14213D] hover:bg-[#F5F7FB]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#14213D] bg-[#F5F7FB] hover:bg-slate-100"
                  >
                    Sign Up
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowDemoModal(true);
                  }}
                  className="w-full text-center py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-semibold hover:bg-[#4338CA]"
                >
                  Explore Demo
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* HERO SECTION - Balanced Two-Column Enterprise Layout */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-white via-[#F5F7FB]/40 to-white">
        {/* Subtle Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN: Value Proposition & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5] text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>AI-Powered Brand Governance & Regulatory Compliance</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#14213D] tracking-tight leading-[1.15]">
                Protect Your Brand. <br className="hidden sm:inline" />
                Govern Every <span className="text-[#4F46E5]">AI-Generated Content</span>.
              </h1>

              {/* Supporting Description */}
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
                InkloomGuard helps marketing and legal teams review promotional copy against statutory regulations, authorized product specifications, and approved brand terminology before public release.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#4F46E5] text-white font-semibold text-xs sm:text-sm hover:bg-[#4338CA] shadow-md transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Return to Dashboard ({user?.role})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDemoModal(true)}
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#4F46E5] text-white font-semibold text-xs sm:text-sm hover:bg-[#4338CA] shadow-md transition-all cursor-pointer"
                  >
                    <span>Explore Demo</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </button>
                )}
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-[#14213D] font-semibold text-xs sm:text-sm hover:bg-[#F5F7FB] border border-[#E2E8F0] shadow-2xs transition-all"
                >
                  Discover How It Works
                </a>
              </div>

              {/* Human-in-the-Loop Principle Statement */}
              <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0] text-xs text-[#14213D] space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-[#4F46E5]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Human-in-the-Loop Principle</span>
                </div>
                <p className="text-[#64748B] text-[11px] leading-relaxed">
                  AI assists with statutory rule retrieval and instant evidence verification. Human reviewers and compliance managers retain final publication authority.
                </p>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[#64748B]">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>FSSAI & ASCI Grounded</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Zero Hallucinations</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>100% Human Sign-Off</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sophisticated Product Dashboard Preview */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Backdrop Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-200/40 via-blue-100/30 to-purple-100/40 blur-xl opacity-70" />

                {/* Main Showcase Window */}
                <div className="relative bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden">
                  {/* Window Chrome Header */}
                  <div className="px-4 py-3 bg-[#F5F7FB] border-b border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span className="text-[11px] font-mono text-[#64748B] ml-2">app.inkloomguard.xyz/review/live</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                      <span>Live Evaluation</span>
                    </span>
                  </div>

                  {/* Dashboard Telemetry Metrics Bar */}
                  <div className="p-4 bg-white border-b border-[#E2E8F0] grid grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0]">
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">Governance</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-xl font-bold text-[#14213D]">94%</span>
                        <span className="text-[10px] text-[#16A34A] font-bold">Optimal</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0]">
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">Submissions</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-xl font-bold text-[#14213D]">14</span>
                        <span className="text-[10px] text-[#64748B]">Active</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0]">
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">Violations Blocked</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-xl font-bold text-[#D97706]">11</span>
                        <span className="text-[10px] text-amber-700 font-bold">Pre-Flight</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Review Studio Card */}
                  <div className="p-4 space-y-3.5 bg-slate-50/50">
                    {/* Submission Header */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#14213D]">SUB-005: Valencia Orange Packaging</span>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                          v1 Draft
                        </span>
                      </div>
                      <span className="text-[11px] text-[#64748B]">Author: Priya Sharma</span>
                    </div>

                    {/* Copy Text with Highlighted Claim */}
                    <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs leading-relaxed text-[#14213D] shadow-2xs">
                      <p>
                        "FreshPlus Valencia Orange Juice: 100% pure cold-pasteurized fruit juice with{' '}
                        <span className="bg-rose-100 text-rose-800 font-semibold px-1 py-0.5 rounded border border-rose-200 underline decoration-rose-400">
                          100% Sugar Free guarantee
                        </span>{' '}
                        and natural vitality booster for instant workplace energy!"
                      </p>
                    </div>

                    {/* AI Finding Notification Box */}
                    <div className="p-3 rounded-xl bg-white border border-rose-200 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span className="text-xs font-bold text-rose-900">FSSAI Regulation 5(3) Contradiction</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          High Severity
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        Pure fruit juice naturally contains fruit sugars exceeding statutory 0.5g/100ml limits. Non-addition claims must satisfy Regulation 6(1) and declare natural sugars.
                      </p>
                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px]">
                        <span className="font-bold text-emerald-950">Grounded Safe Replacement: </span>
                        <span className="text-emerald-800 font-medium">"Zero Added Cane Sugar" (Compliant with Spec #FP-SPEC-2025-01)</span>
                      </div>
                    </div>

                    {/* Human Sign-Off Action Bar */}
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 text-[#64748B] text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                        <span>Assigned to: Arjun Patel (Reviewer)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-600 text-white shadow-2xs">
                          Ready for Human Approval
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE SECTION - The Authoritative Brand Governance Studio */}
      <section id="product" className="py-20 bg-[#F5F7FB] border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold text-[#4F46E5] tracking-wider">Product In Action</span>
            <h2 className="text-3xl font-extrabold text-[#14213D] mt-2">
              The Authoritative Brand Governance & Review Studio
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              A single operational platform connecting creators, compliance reviewers, and marketing managers with deterministic statutory grounding.
            </p>
          </div>

          {/* Large Studio Dashboard Mockup */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden">
            {/* Studio Navigation Header */}
            <div className="p-3.5 bg-slate-100/90 border-b border-[#E2E8F0] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                </div>
                <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block"></div>
                <span className="font-semibold text-[#14213D] hidden sm:inline">FreshPlus Global Brand Governance Workspace</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                  Active Persona: Reviewer (Arjun Patel)
                </span>
                <span className="text-xs text-[#64748B] font-mono hidden md:inline">v2.4.0-verified</span>
              </div>
            </div>

            {/* Studio Body: Sidebar + Main Content Layout */}
            <div className="grid lg:grid-cols-12 min-h-[460px]">
              {/* Studio Mock Sidebar */}
              <div className="hidden lg:block lg:col-span-3 bg-[#F5F7FB] border-r border-[#E2E8F0] p-4 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider px-2">Navigation</span>
                  <div className="flex items-center space-x-2 px-2.5 py-2 rounded-lg bg-indigo-50 text-[#4F46E5] font-semibold text-xs border border-indigo-200">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard Overview</span>
                  </div>
                  <div className="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[#64748B] hover:text-[#14213D] font-medium text-xs">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Content Submissions</span>
                  </div>
                  <div className="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[#64748B] hover:text-[#14213D] font-medium text-xs">
                    <BookOpen className="w-4 h-4" />
                    <span>Brand Knowledge</span>
                  </div>
                  <div className="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[#64748B] hover:text-[#14213D] font-medium text-xs">
                    <Scale className="w-4 h-4" />
                    <span>Regulatory Rules</span>
                  </div>
                  <div className="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[#64748B] hover:text-[#14213D] font-medium text-xs">
                    <BarChart3 className="w-4 h-4" />
                    <span>Risk Analytics</span>
                  </div>
                  <div className="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[#64748B] hover:text-[#14213D] font-medium text-xs">
                    <History className="w-4 h-4" />
                    <span>Audit Trail</span>
                  </div>
                </div>

                {/* Workspace Health Snapshot */}
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#14213D]">
                    <span>Workspace Health</span>
                    <span className="text-[#16A34A]">Healthy</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-[#16A34A] h-1.5 rounded-full w-[94%]"></div>
                  </div>
                  <p className="text-[10px] text-[#64748B]">24 rules active • 0 unverified citations</p>
                </div>
              </div>

              {/* Studio Mock Main View */}
              <div className="lg:col-span-9 p-6 space-y-6 bg-white">
                {/* 4 Mini KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0]">
                    <span className="text-[10px] font-semibold text-[#64748B]">Compliance Score</span>
                    <p className="text-xl font-bold text-[#14213D] mt-0.5">94%</p>
                    <span className="text-[10px] text-[#16A34A] font-semibold">Zero critical leaks</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0]">
                    <span className="text-[10px] font-semibold text-[#64748B]">Total Reviews</span>
                    <p className="text-xl font-bold text-[#14213D] mt-0.5">14 Assets</p>
                    <span className="text-[10px] text-[#64748B]">Across 4 media channels</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0]">
                    <span className="text-[10px] font-semibold text-[#64748B]">Pre-Flight Blocks</span>
                    <p className="text-xl font-bold text-[#D97706] mt-0.5">11 Violations</p>
                    <span className="text-[10px] text-amber-700 font-semibold">Prevented before launch</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0]">
                    <span className="text-[10px] font-semibold text-[#64748B]">Human Sign-Off</span>
                    <p className="text-xl font-bold text-[#4F46E5] mt-0.5">1 Pending</p>
                    <span className="text-[10px] text-indigo-700 font-semibold">Reviewer queue</span>
                  </div>
                </div>

                {/* Split Content Review Panel */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Left: Draft Content Review */}
                  <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#14213D]">Draft Content Comparison (v1 → v2)</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#64748B]">
                        Instagram Ad
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-950 text-[11px] leading-relaxed line-through">
                        "FreshPlus is the only 100% cure for daily office fatigue with instant guaranteed immunity boosting!"
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px] leading-relaxed">
                        "FreshPlus 100% Valencia Orange Juice provides a rich source of Vitamin C to support your daily wellness routine."
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>Revision Author: Priya Sharma</span>
                      <span className="text-[#16A34A] font-semibold">Diff Approved by Reviewer</span>
                    </div>
                  </div>

                  {/* Right: Statutory Citation & Grounding */}
                  <div className="p-4 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#14213D]">Statutory Rule Citations Applied</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                        2 Citations
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#14213D]">FSSAI Regulation 7 & 10(1)</span>
                          <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Remediated
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B]">
                          Removed prohibited therapeutic disease cure claims; replaced with authorized nutrient support function.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#14213D]">ASCI Code Clause 1.4</span>
                          <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Remediated
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B]">
                          Unsubstantiated absolute superlative ("the only 100% cure") replaced with evidence-backed formulation claim.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B]">Traceability: SHA-256 Audit Stamp</span>
                      <span className="font-mono text-[10px] text-slate-400">#LOG-4829</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION - Asymmetric Premium Layout */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold text-[#4F46E5] tracking-wider">Comprehensive Governance Suite</span>
            <h2 className="text-3xl font-extrabold text-[#14213D] mt-2">
              Five Architectural Pillars of Brand Protection
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              Purpose-built capabilities engineered to prevent misleading claims, enforce regulatory grounding, and guarantee human oversight.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Large Panel (AI Content Review) */}
            <div className="lg:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-[#F5F7FB] to-indigo-50/20 border border-[#E2E8F0] space-y-4 hover:border-indigo-300 transition-all shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  Real-Time Pre-Flight
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#14213D]">1. AI Content Review Engine</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-2xl">
                Automatically scans marketing drafts across channels to detect unsupported claims, risky language, statutory contradictions, and brand deviations with exact text highlights and verified rewrite suggestions.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                  <span className="font-bold text-[#14213D] block">Exact Spans</span>
                  <span className="text-[11px] text-[#64748B]">Pinpoints exact offending words</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                  <span className="font-bold text-[#14213D] block">Rule Grounding</span>
                  <span className="text-[11px] text-[#64748B]">Zero hallucinated provisions</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                  <span className="font-bold text-[#14213D] block">Safe Rewrites</span>
                  <span className="text-[11px] text-[#64748B]">Pre-approved compliant alternatives</span>
                </div>
              </div>
            </div>

            {/* Feature 2: Brand Knowledge Repository */}
            <div className="p-8 rounded-2xl bg-[#F5F7FB] border border-[#E2E8F0] space-y-4 hover:border-indigo-300 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#14213D]">2. Brand Knowledge Repository</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Centralizes approved product facts, lab test certificates, nutrition specifications, and protected brand terminology in a version-controlled source of truth.
              </p>
              <ul className="space-y-1.5 text-xs text-[#14213D] pt-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Approved product specifications</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Protected trademark terminology</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Official packaging disclaimer rules</span>
                </li>
              </ul>
            </div>

            {/* Feature 3: Regulatory Compliance Grounding */}
            <div className="p-8 rounded-2xl bg-[#F5F7FB] border border-[#E2E8F0] space-y-4 hover:border-indigo-300 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#14213D]">3. Regulatory Compliance</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Evaluates claims directly against verified provisions from FSSAI Advertising Regulations, ASCI Advertising Code, and CCPA Misleading Ads Guidelines.
              </p>
              <ul className="space-y-1.5 text-xs text-[#14213D] pt-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Comparative nutrient claim thresholds</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Sugar-Free & No Added Sugar checks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Prohibited disease cure assertions</span>
                </li>
              </ul>
            </div>

            {/* Feature 4: Human-in-the-Loop Approval */}
            <div className="p-8 rounded-2xl bg-[#F5F7FB] border border-[#E2E8F0] space-y-4 hover:border-indigo-300 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#14213D]">4. Human-in-the-Loop Approval</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Empowers creators with automated guidance while ensuring designated human reviewers and compliance managers retain sole publication authority.
              </p>
              <ul className="space-y-1.5 text-xs text-[#14213D] pt-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Role-based permissions & workflows</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Side-by-side diff inspection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Zero unauthorized publication risk</span>
                </li>
              </ul>
            </div>

            {/* Feature 5: Cryptographic Audit Trail */}
            <div className="p-8 rounded-2xl bg-[#F5F7FB] border border-[#E2E8F0] space-y-4 hover:border-indigo-300 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#14213D]">5. Immutable Audit Trail</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Maintains a permanent, tamper-evident record of all content submissions, version diffs, accepted AI findings, and human sign-off timestamps.
              </p>
              <ul className="space-y-1.5 text-xs text-[#14213D] pt-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Complete revision lineage (v1 → v2)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Timestamped reviewer sign-offs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>One-click PDF/CSV compliance exports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION - 4-Step Visual Workflow */}
      <section id="how-it-works" className="py-20 bg-[#F5F7FB] border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold text-[#4F46E5] tracking-wider">Workflow Architecture</span>
            <h2 className="text-3xl font-extrabold text-[#14213D] mt-2">
              How InkloomGuard Governs Marketing Content
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              A clear four-stage operational pipeline from initial draft composition to regulatory sign-off.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-4 shadow-sm relative group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-[#4F46E5]">01</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <h4 className="font-bold text-[#14213D] text-base">Submit Content</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Creators input draft marketing copy across packaging mockups, social media campaigns, print collateral, or video scripts.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#4F46E5] flex items-center space-x-1">
                <span>Creator Persona</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-4 shadow-sm relative group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-[#4F46E5]">02</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold text-xs">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <h4 className="font-bold text-[#14213D] text-base">AI Governance Review</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Inkloom AI cross-references submitted statements against statutory regulations, authorized product specifications, and preferred terminology.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#4F46E5] flex items-center space-x-1">
                <span>Deterministic Grounding</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-4 shadow-sm relative group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-[#4F46E5]">03</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <h4 className="font-bold text-[#14213D] text-base">Review Findings</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Offending text spans are highlighted with official clause citations, risk severity levels, and evidence-safe rewrite suggestions.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#4F46E5] flex items-center space-x-1">
                <span>Exact Text Diffing</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-4 shadow-sm relative group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-[#4F46E5]">04</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <h4 className="font-bold text-[#14213D] text-base">Human Approval</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Designated human reviewers and compliance managers verify the final version and authorize publication sign-off recorded in the audit trail.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#16A34A] flex items-center space-x-1">
                <span>Final Authority</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND GOVERNANCE & STATUTORY TRUST SECTION */}
      <section id="governance" className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold text-[#4F46E5] tracking-wider">Statutory Integrity & Data Safety</span>
            <h2 className="text-3xl font-extrabold text-[#14213D] mt-2">
              Built on Explainability and Authoritative Law
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              Unlike generic generative wrappers, InkloomGuard enforces strict provenance boundaries so enterprise legal teams can audit every decision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Statutory Compliance Grounding Card */}
            <div className="p-8 rounded-2xl bg-[#F5F7FB] border border-[#E2E8F0] space-y-5">
              <div className="inline-flex p-3 rounded-xl bg-indigo-50 text-[#4F46E5]">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#14213D]">Statutory Source Grounding</h3>
                <p className="text-xs text-[#64748B] leading-relaxed mt-1">
                  Every regulatory finding references verified Gazette provisions and codified advertising standards:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-start space-x-3">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#14213D]">FSSAI Advertising & Claims Regulations</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Regulation 5(3) & 6(1) Sugar-Free rules, Regulation 5(4) comparative nutrient thresholds, and Regulation 7 disease risk prohibitions.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-start space-x-3">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#14213D]">ASCI Advertising Code</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Clauses 1.1 and 1.4 governing substantiated scientific evidence, superlative claims, and disclaimer legibility requirements.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-start space-x-3">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#14213D]">Consumer Protection Act (CCPA)</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Guidelines for Prevention of Misleading Advertisements 2022 covering upfront influencer disclosures and deceptive assertions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise Security & Data Isolation Card */}
            <div className="p-8 rounded-2xl bg-[#F5F7FB] border border-[#E2E8F0] space-y-5">
              <div className="inline-flex p-3 rounded-xl bg-indigo-50 text-[#4F46E5]">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#14213D]">Enterprise Isolation & Security</h3>
                <p className="text-xs text-[#64748B] leading-relaxed mt-1">
                  Engineered with strict customer knowledge boundaries, prompt defense, and automated data sanitization:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-start space-x-3">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#14213D]">Client-Side PII Sanitization</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Automatic detection and masking of phone numbers, Aadhaar, PAN, and employee emails before submission to evaluation services.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-start space-x-3">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#14213D]">Prompt Injection Boundary Separation</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Submitted promotional copy is isolated as untrusted data, preventing adversarial instruction overrides or unauthorized disclosures.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-start space-x-3">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#14213D]">Deterministic Fallback Engine</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Rule evaluation continues uninterrupted during offline states or API latency via client-side regulatory knowledge rules.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL ENTERPRISE CALL TO ACTION */}
      <section className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#F5F7FB] to-white border border-[#E2E8F0] shadow-sm space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              FreshPlus Global Evaluation Workspace
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14213D] tracking-tight">
              Govern Every Marketing Asset with Confidence
            </h2>
            <p className="text-sm text-[#64748B] max-w-2xl mx-auto leading-relaxed">
              Experience the end-to-end governance lifecycle in an interactive demo environment. Switch seamlessly between Creator, Reviewer, and Manager roles to inspect workflows.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#4F46E5] text-white font-semibold text-xs sm:text-sm hover:bg-[#4338CA] shadow-md transition-all cursor-pointer"
              >
                <span>Explore Demo Workspaces</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-[#14213D] font-semibold text-xs sm:text-sm hover:bg-slate-50 border border-[#E2E8F0] shadow-2xs transition-all"
              >
                Sign In with Credentials
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-14 bg-[#14213D] text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
            {/* Col 1 */}
            <div className="space-y-3 col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-white font-bold text-base tracking-tight">InkloomGuard</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                Enterprise AI Brand Governance & Pre-Publication Regulatory Compliance Platform.
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Domain: inkloomguard.xyz</p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2.5">
              <p className="text-white font-semibold text-xs uppercase tracking-wider">Product</p>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#product" className="hover:text-white transition-colors">
                    Review Studio
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Knowledge Repository
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    4-Step Workflow
                  </a>
                </li>
                <li>
                  <a href="#governance" className="hover:text-white transition-colors">
                    Regulatory Rules
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2.5">
              <p className="text-white font-semibold text-xs uppercase tracking-wider">Regulatory Standards</p>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <span>FSSAI Advertising Regulations 2024</span>
                </li>
                <li>
                  <span>ASCI Code for Self-Regulation 2023</span>
                </li>
                <li>
                  <span>CCPA Misleading Ads Guidelines 2022</span>
                </li>
                <li>
                  <span>Drugs & Magic Remedies Act 1954</span>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2.5">
              <p className="text-white font-semibold text-xs uppercase tracking-wider">Access</p>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setShowDemoModal(true)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Explore Demo Workspaces
                  </button>
                </li>
                <li>
                  <a href="https://inkloomguard.xyz" className="hover:text-white transition-colors">
                    Production Domain
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 InkloomGuard. Enterprise Brand Governance Platform. All rights reserved.</p>
            <p>Evaluation Workspace: FreshPlus Global • Strictly isolated mock environment</p>
          </div>
        </div>
      </footer>

      {/* DEMO ROLE SELECTION MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Interactive Evaluation Workspace
                </span>
                <h3 className="text-xl font-bold text-[#14213D] mt-2">Select Your Demo Perspective</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Choose a persona to explore role-specific governance capabilities for FreshPlus Global:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Role Selection Cards */}
            <div className="space-y-3">
              {/* Role 1: Creator */}
              <button
                type="button"
                onClick={() => handleSelectRole('creator')}
                disabled={loadingRole !== null}
                className="w-full text-left p-4 rounded-xl border border-[#E2E8F0] hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-start justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#14213D] text-sm group-hover:text-blue-700">Priya Sharma</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Creator Role
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Drafts campaign copy, runs automated pre-flight checks, and inspects AI suggestions.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">creator@freshplus.io</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 mt-2 shrink-0 transition-colors" />
              </button>

              {/* Role 2: Reviewer */}
              <button
                type="button"
                onClick={() => handleSelectRole('reviewer')}
                disabled={loadingRole !== null}
                className="w-full text-left p-4 rounded-xl border border-[#E2E8F0] hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex items-start justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#14213D] text-sm group-hover:text-emerald-700">Arjun Patel</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Reviewer Role
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Audits statutory citations, inspects revision diffs, and grants official human publication approval.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">reviewer@freshplus.io</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 mt-2 shrink-0 transition-colors" />
              </button>

              {/* Role 3: Manager */}
              <button
                type="button"
                onClick={() => handleSelectRole('manager')}
                disabled={loadingRole !== null}
                className="w-full text-left p-4 rounded-xl border border-[#E2E8F0] hover:border-purple-400 hover:bg-purple-50/40 transition-all flex items-start justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#14213D] text-sm group-hover:text-purple-700">Rohan Mehta</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      Manager Role
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Curates brand knowledge & regulatory rules, monitors governance analytics, and audits immutable logs.
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">manager@freshplus.io</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 mt-2 shrink-0 transition-colors" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F7FB] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
              <span>Demo evaluation workspace is completely isolated. Changes never mutate real production datasets.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
