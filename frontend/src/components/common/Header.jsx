import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Calendar, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Shield, 
  BarChart2, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { attendanceService } from '../../services/attendanceService';
import Badge from './Badge';

export const Header = () => {
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const role = user?.role || 'EMPLOYEE';
  const isAdmin = role === 'ADMIN';
  const isHr = role === 'HR' || role === 'ADMIN';

  // Load today's punch status for the logged in user
  const fetchPunchStatus = async () => {
    if (isAdmin) return; // Admin does not need check in
    try {
      const today = await attendanceService.getTodayStatus();
      setTodayAttendance(today);
    } catch (err) {
      console.error('Error fetching today attendance:', err);
    }
  };

  useEffect(() => {
    fetchPunchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchPunchStatus, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const isCheckedIn = Boolean(
    todayAttendance && 
    todayAttendance.check_in && 
    !todayAttendance.check_out
  );

  const formatCheckInTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handlePunchToggle = async () => {
    setPunchLoading(true);
    try {
      if (isCheckedIn) {
        await attendanceService.checkOut();
        addToast('Check-out recorded successfully.', 'success');
      } else {
        await attendanceService.checkIn();
        addToast('Check-in recorded! You are marked as Present.', 'success');
      }
      await fetchPunchStatus();
      // Notify employee cards & views in real-time
      window.dispatchEvent(new Event('attendance-updated'));
    } catch (err) {
      console.error('Punch action failed:', err);
      addToast(err.message || 'Attendance action failed', 'error');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand / Company Logo & Main Navigation Tabs */}
        <div className="flex items-center gap-6">
          {/* Logo & Company Name */}
          <NavLink 
            to="/" 
            className="flex items-center gap-2.5 text-slate-100 hover:text-purple-300 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              OI
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-white block">
                {user?.company_name || 'Odoo India'}
              </span>
              <span className="text-[10px] text-purple-400 font-medium tracking-wide uppercase block -mt-0.5">
                HRMS Platform
              </span>
            </div>
          </NavLink>

          {/* Primary Odoo Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/employees"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isActive || location.pathname === '/' || location.pathname === '/employee/dashboard' || location.pathname === '/hr/employees'
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`
              }
            >
              <Users className="w-3.5 h-3.5" />
              <span>Employees</span>
            </NavLink>

            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isActive || location.pathname.includes('/attendance')
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`
              }
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Attendance</span>
            </NavLink>

            <NavLink
              to="/time-off"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isActive || location.pathname.includes('/time-off') || location.pathname.includes('/leave')
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`
              }
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Time Off</span>
            </NavLink>

            {isHr && (
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`
                }
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Reports</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right: Systray (Live Attendance Punch Widget + Status Dot + Avatar Dropdown) */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Employee-Only Live Check-In / Check-Out Systray Widget (Admin doesn't need check-in) */}
          {!isAdmin && (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 shadow-sm">
              {/* Live Status Indicator Dot: Red = Checked Out / Green = Checked In */}
              <div 
                className="flex items-center gap-1.5"
                title={isCheckedIn ? 'Status: Checked In (Present)' : 'Status: Checked Out (Absent)'}
              >
                <span 
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    isCheckedIn 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse' 
                      : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                  }`} 
                />
              </div>

              {/* Quick Punch Action Button */}
              <button
                onClick={handlePunchToggle}
                disabled={punchLoading}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  isCheckedIn
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-500'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-500'
                }`}
              >
                {punchLoading ? (
                  <span>Updating...</span>
                ) : isCheckedIn ? (
                  <>
                    <span className="text-[10px] text-slate-400 font-normal hidden lg:inline">
                      Since {formatCheckInTime(todayAttendance?.check_in)}
                    </span>
                    <span className="flex items-center gap-1">
                      Check Out <LogOut className="w-3 h-3 ml-0.5" />
                    </span>
                  </>
                ) : (
                  <span className="flex items-center gap-1">
                    Check IN <LogIn className="w-3 h-3 ml-0.5 text-emerald-400" />
                  </span>
                )}
              </button>
            </div>
          )}

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 focus:outline-none"
              aria-expanded={profileDropdownOpen}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden border border-purple-400/40">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.first_name} className="w-full h-full object-cover" />
                ) : (
                  user?.first_name ? user.first_name[0].toUpperCase() : 'U'
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>{user?.first_name} {user?.last_name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-purple-300 font-mono">
                  {user?.employee_id || 'OI...'}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {user?.employee_id}
                    </p>
                    <div className="mt-1.5">
                      <Badge variant={isAdmin ? 'warning' : isHr ? 'success' : 'info'} size="sm">
                        {role}
                      </Badge>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-purple-600/20 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-purple-400" />
                      <span>My Profile</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/admin/dashboard');
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-purple-600/20 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Admin Console</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
