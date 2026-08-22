import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Clock,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Users,
  Building2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import ErrorAlert from '../../components/common/ErrorAlert';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
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
      const profile = await login(email, password);
      addToast(`Welcome back, ${profile.first_name}!`, 'success');

      // Role-based routing
      if (profile.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (profile.role === 'HR') {
        navigate('/hr/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid work email or password. Please verify your credentials.');
      addToast('Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectQuickAccount = (sampleEmail, samplePassword) => {
    setEmail(sampleEmail);
    setPassword(samplePassword);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-brand-500/30 selection:text-brand-200">
      {/* LEFT HERO SECTION (Visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 lg:p-16 border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#0d1322] to-brand-950/40 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Brand Identity */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-black text-lg text-white shadow-glow-brand border border-brand-400/30">
              DF
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2">
                Dayflow <span className="text-brand-400 font-medium">HRMS</span>
              </div>
              <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
                Enterprise Workforce Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Value Proposition & Feature Highlights */}
        <div className="relative z-10 space-y-8 my-auto">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/25">
              <Sparkles className="w-3.5 h-3.5" /> Next-Generation HR Operating System
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Streamline attendance, payroll & operations in one unified workspace.
            </h2>
            <p className="text-sm xl:text-base text-slate-400 leading-relaxed max-w-lg">
              Empower your employees with effortless self-service, provide HR teams with automated approval workflows, and equip leadership with real-time workforce analytics.
            </p>
          </div>

          {/* Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-slate-200">Real-Time Timesheets</div>
              <p className="text-xs text-slate-400">One-click check-in/out and automated shift logging</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-slate-200">1-Click Payroll Cycles</div>
              <p className="text-xs text-slate-400">Automated allowances, tax deductions & digital payslips</p>
            </div>
          </div>
        </div>

        {/* Bottom: Trust & Compliance Pill */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Role-Based Access Control • JWT Enforced</span>
          </div>
          <span className="text-slate-400">Dayflow Cloud v1.0</span>
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        {/* Subtle decorative glow for mobile */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none lg:hidden" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Mobile Brand Header */}
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-flex lg:hidden items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-xl shadow-glow-brand border border-brand-400/30 mb-2">
              DF
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Enter your corporate credentials to access your Dayflow portal
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
            {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Work Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-slate-300">
                  Work Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@dayflow.com"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-150"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-slate-300">
                  Account Password
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
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-150"
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
                className="w-full h-11 mt-2 text-sm font-semibold shadow-md hover:shadow-glow-brand"
                icon={ArrowRight}
                iconPosition="right"
              >
                {loading ? 'Authenticating Credentials...' : 'Sign In to Workspace'}
              </Button>
            </form>

            {/* 1-Click Quick Demo Accounts */}
            <div className="pt-5 border-t border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Instant Demo Access:
                </span>
                <span className="text-[10px] text-slate-400">1-Click Auto-Fill</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => selectQuickAccount('vishaal@dayflow.com', 'Admin@123')}
                  className="px-2.5 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all text-center flex flex-col items-center gap-0.5"
                >
                  <span>Admin</span>
                  <span className="text-[9px] text-amber-400/80 font-normal">Full Control</span>
                </button>
                <button
                  type="button"
                  onClick={() => selectQuickAccount('sharan@dayflow.com', 'Hr@123')}
                  className="px-2.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-center flex flex-col items-center gap-0.5"
                >
                  <span>HR Officer</span>
                  <span className="text-[9px] text-emerald-400/80 font-normal">Manage & Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => selectQuickAccount('saaral@dayflow.com', 'Employee@123')}
                  className="px-2.5 py-2 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/25 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all text-center flex flex-col items-center gap-0.5"
                >
                  <span>Employee</span>
                  <span className="text-[9px] text-sky-400/80 font-normal">Self-Service</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Link to Register */}
          <div className="text-center text-xs text-slate-400">
            Need to onboard a new employee profile?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-400 hover:text-brand-300 transition-colors underline-offset-4 hover:underline"
            >
              Register Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
