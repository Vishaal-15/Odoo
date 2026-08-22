import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Search, Menu, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Badge from './Badge';

export const Header = ({ onToggleMobileMenu }) => {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';

  const roleVariant = role === 'ADMIN' ? 'warning' : role === 'HR' ? 'success' : 'info';
  const notifPath = role === 'EMPLOYEE' ? '/employee/notifications' : '/hr/notifications';

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile menu trigger + Workspace label */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Dayflow Cloud HRMS</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">Production v1.0</span>
        </div>
      </div>

      {/* Right: Actions, Notifications, Role Badge & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Role Badge */}
        <Badge variant={roleVariant} size="sm">
          {role}
        </Badge>

        {/* Notifications Icon Button */}
        <NavLink
          to={notifPath}
          title="Notifications"
          className={({ isActive }) =>
            `relative p-2 rounded-lg border transition-all duration-150 ${
              isActive
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-700/60'
            }`
          }
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-slate-900" />
        </NavLink>

        {/* User Avatar Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-200 line-clamp-1">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1">
              {user?.email}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
