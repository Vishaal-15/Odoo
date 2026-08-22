import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Building2
} from 'lucide-react';
import Button from '../../components/common/Button';
import ErrorAlert from '../../components/common/ErrorAlert';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile = await login(identifier, password);
      addToast(`Welcome back, ${profile.first_name || 'User'}!`, 'success');
      navigate('/employees');
    } catch (err) {
      setError(err.message || 'Invalid Login ID / Email or password. Please verify credentials.');
      addToast('Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectQuickAccount = (sampleIdentifier, samplePassword) => {
    setIdentifier(sampleIdentifier);
    setPassword(samplePassword);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0f19] text-slate-100 font-sans p-4 sm:p-6 antialiased">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Header / Logo (matching wireframe) */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-2xl shadow-xl border border-purple-400/30 mb-1">
            OI
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Odoo India HRMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in using your Login ID or Work Email
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Login ID / Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-300">
                Login Id / Email :-
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. OIVIAK20230001 or admin@dayflow.com"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-150"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-300">
                Password :-
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full h-11 mt-2 text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all"
              icon={ArrowRight}
              iconPosition="right"
            >
              {loading ? 'Authenticating...' : 'SIGN IN'}
            </Button>
          </form>

          {/* Quick Demo Access Buttons with Odoo Login IDs */}
          <div className="pt-4 border-t border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Demo Sign In:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => selectQuickAccount('OIVIAK20230001', 'Admin@123')}
                className="px-2 py-2 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/25 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all text-center flex flex-col items-center gap-0.5"
              >
                <span>Admin</span>
                <span className="text-[9px] text-purple-400 font-mono">OIVIAK20230001</span>
              </button>
              <button
                type="button"
                onClick={() => selectQuickAccount('OISHBA20230002', 'Hr@123')}
                className="px-2 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-center flex flex-col items-center gap-0.5"
              >
                <span>HR Officer</span>
                <span className="text-[9px] text-emerald-400 font-mono">OISHBA20230002</span>
              </button>
              <button
                type="button"
                onClick={() => selectQuickAccount('OISASA20230003', 'Employee@123')}
                className="px-2 py-2 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/25 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all text-center flex flex-col items-center gap-0.5"
              >
                <span>Employee</span>
                <span className="text-[9px] text-sky-400 font-mono">OISASA20230003</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Link to Sign Up */}
        <div className="text-center text-xs text-slate-400">
          Don't have an Account?{' '}
          <Link
            to="/register"
            className="font-bold text-purple-400 hover:text-purple-300 transition-colors underline-offset-4 hover:underline"
          >
            Sign Up →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
