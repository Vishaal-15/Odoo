import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { Mail, KeyRound, Shield, ArrowRight, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ErrorAlert from '../../components/common/ErrorAlert';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0b0f19] relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-extrabold text-lg shadow-glow-brand mb-1">
            DF
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 font-sans">
            Dayflow HRMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to access your enterprise workspace
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@dayflow.com"
              icon={Mail}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={KeyRound}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </Button>
          </form>

          {/* 1-Click Quick Demo Accounts */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Demo Accounts:
              </span>
              <span className="text-[10px] text-slate-400">Pre-seeded</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => selectQuickAccount('admin@dayflow.com', 'Admin@123')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => selectQuickAccount('hr@dayflow.com', 'Hr@123')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-center"
              >
                HR Officer
              </button>
              <button
                type="button"
                onClick={() => selectQuickAccount('employee@dayflow.com', 'Employee@123')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/25 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all text-center"
              >
                Employee
              </button>
            </div>
          </div>
        </div>

        {/* Register Footer */}
        <div className="text-center text-xs text-slate-400">
          Need to onboard a new employee profile?{' '}
          <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
