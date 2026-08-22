import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { UserPlus, Mail, Lock, User, Briefcase, Hash, Building2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import ErrorAlert from '../../components/common/ErrorAlert';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE',
    department: 'Software Engineering',
    job_title: 'Software Engineer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        department: formData.department,
        job_title: formData.job_title,
        employee_id: formData.employee_id,
      });

      addToast('Registration successful! Please sign in with your credentials.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify the input parameters.');
      addToast('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#0b0f19] relative overflow-hidden font-sans text-slate-100 antialiased selection:bg-brand-500/30 selection:text-brand-200">
      {/* Ambient background decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-xl shadow-glow-brand border border-brand-400/30 mb-1">
            DF
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Employee Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create an enterprise profile in Dayflow HRMS
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-slate-300">First Name</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Sarah"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-slate-300">Last Name</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Connor"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email & ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-slate-300">Work Email</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sarah@dayflow.com"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-slate-300">Employee ID / Code</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="employee_id"
                    required
                    value={formData.employee_id}
                    onChange={handleChange}
                    placeholder="EMP045"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Department & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                icon={Building2}
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
              </Select>

              <Select
                label="Access Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                icon={Briefcase}
              >
                <option value="EMPLOYEE">Employee (Self-service)</option>
                <option value="HR">HR Officer (Management)</option>
                <option value="ADMIN">System Administrator</option>
              </Select>
            </div>

            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-slate-300">Job Title / Designation</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="job_title"
                  required
                  value={formData.job_title}
                  onChange={handleChange}
                  placeholder="Senior Full Stack Engineer"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-slate-300">Password</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
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

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-slate-300">Confirm Password</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full h-11 mt-2 text-sm font-semibold shadow-md hover:shadow-glow-brand"
              icon={UserPlus}
            >
              {loading ? 'Submitting Registration...' : 'Complete Employee Registration'}
            </Button>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center text-xs text-slate-400">
          Already have an enterprise account?{' '}
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors underline-offset-4 hover:underline">
            Sign In here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
