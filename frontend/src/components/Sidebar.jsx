import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  LayoutDashboard,
  FileText,
  PlusCircle,
  BookOpen,
  BarChart3,
  History,
  ShieldAlert,
  Sparkles,
  Layers,
  Compass,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle
} from 'lucide-react';

export default function Sidebar({ collapsed = false, onToggleCollapse }) {
  const { user, logout, startTour } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      tourId: 'nav-home',
      roles: ['creator', 'reviewer', 'manager']
    },
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      tourId: 'nav-dashboard',
      roles: ['creator', 'reviewer', 'manager']
    },
    {
      label: role === 'reviewer' ? 'Review Queue' : 'Content Submissions',
      path: '/content',
      icon: FileText,
      tourId: 'nav-submissions',
      roles: ['creator', 'reviewer', 'manager']
    },
    {
      label: 'Submit Content',
      path: '/content/new',
      icon: PlusCircle,
      tourId: 'nav-submit',
      roles: ['creator', 'manager']
    },
    {
      label: 'Brand Knowledge',
      path: '/guidelines',
      icon: BookOpen,
      tourId: 'nav-knowledge',
      roles: ['creator', 'reviewer', 'manager'],
      badge: role === 'manager' ? 'Editor' : 'Library'
    },
    {
      label: 'Governance Analytics',
      path: '/analytics',
      icon: BarChart3,
      tourId: 'nav-analytics',
      roles: ['reviewer', 'manager']
    },
    {
      label: 'Audit Trail',
      path: '/audit',
      icon: History,
      tourId: 'nav-audit',
      roles: ['manager']
    }
  ];

  // Precise route matching so Content Submissions does not stay active on Submit Content or other pages
  const isNavActive = (item) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    if (item.path === '/content') {
      // Active on /content or /content/:id, but explicitly NOT on /content/new
      return (
        location.pathname === '/content' ||
        (location.pathname.startsWith('/content/') && location.pathname !== '/content/new')
      );
    }
    if (item.path === '/content/new') {
      return location.pathname === '/content/new';
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800 transition-all duration-300 select-none sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto`}
    >
      {/* Workspace Context & Collapse Toggle */}
      <div
        data-tour="brand-workspace"
        className={`${
          collapsed ? 'p-3 flex flex-col items-center space-y-2' : 'p-4 flex items-start justify-between'
        } border-b border-slate-800 transition-all`}
      >
        {collapsed ? (
          <>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4 text-brand-400" />
            </button>
            <div
              className="p-2 rounded-lg bg-slate-800 text-brand-400 cursor-pointer hover:bg-slate-700 transition-colors"
              title="Brand Workspace: FreshPlus Global (Enterprise FMCG)"
              onClick={onToggleCollapse}
            >
              <Layers className="w-4 h-4" />
            </div>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Layers className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="truncate">Brand Workspace</span>
              </div>
              <p className="text-sm font-bold text-white mt-1 tracking-tight truncate">FreshPlus Global</p>
              <p className="text-[11px] text-slate-400 truncate">Enterprise Brand Workspace</p>
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2 shrink-0"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Nav Links */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} py-4 space-y-1.5`}>
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-tour={item.tourId}
                title={collapsed ? item.label : undefined}
                className={`flex items-center ${
                  collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                } rounded-lg text-xs font-medium transition-all group relative focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  active
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className={`flex items-center ${collapsed ? '' : 'space-x-3 min-w-0'}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0 ml-1">
                    {item.badge}
                  </span>
                )}

                {/* Compact Mode Floating Hover Tooltip */}
                {collapsed && (
                  <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-[11px] font-semibold rounded shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
      </nav>

      {/* Interactive Quick Tour Launcher */}
      <div className={`${collapsed ? 'px-2' : 'px-3'} pb-2`}>
        <button
          type="button"
          onClick={startTour}
          className={`w-full flex items-center justify-center ${
            collapsed ? 'p-2.5' : 'space-x-2 px-3 py-2'
          } rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors group relative`}
          title="Launch Guided Onboarding Tour"
        >
          <Compass className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          {!collapsed && <span>Interactive Tour</span>}

          {/* Compact Mode Floating Tooltip */}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-[11px] font-semibold rounded shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
              Interactive Tour
            </span>
          )}
        </button>
      </div>

      {/* Governance Philosophy Footer (Visible when expanded) */}
      {!collapsed && (
        <div className="p-3.5 m-3 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-400 text-[11px] space-y-1.5">
          <div className="flex items-center space-x-1.5 text-brand-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Human-in-the-Loop</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            AI assists with citations & suggestions. Humans hold final publication authority.
          </p>
        </div>
      )}

      {/* User Session & Logout in Sidebar */}
      <div className={`${collapsed ? 'px-2' : 'px-3'} pb-3 border-t border-slate-800 pt-3`}>
        {collapsed ? (
          <div className="flex flex-col items-center space-y-2">
            <div
              className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold"
              title={`${user.name} (${user.role} • ${user.organization})`}
            >
              {user.name?.charAt(0) || 'U'}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors group relative border border-transparent hover:border-rose-800/40"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-rose-300 text-[11px] font-semibold rounded shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                Log Out
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-400">
            <div className="truncate mr-2">
              <p className="font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 capitalize truncate">
                {user.role} • {user.organization}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors shrink-0 border border-transparent hover:border-rose-800/40"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
