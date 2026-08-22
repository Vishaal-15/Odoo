import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { 
  Building, 
  UploadCloud, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus 
} from 'lucide-react';
import Button from '../../components/common/Button';
import ErrorAlert from '../../components/common/ErrorAlert';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    company_name: 'Odoo India',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        company_name: formData.company_name,
        phone: formData.phone,
      });

      addToast('Registration successful! You can now sign in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      addToast('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#0b0f19] text-slate-100 font-sans antialiased">
      <div className="w-full max-w-lg relative z-10 space-y-5">
        
        {/* Header Logo */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-xl shadow-lg border border-purple-400/30">
            OI
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Register Company & Employee
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Set up your organization and admin user profile
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Company Name & Logo Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-300">Company Name</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="company_name"
                    required
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="e.g. Odoo India"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Company Logo</label>
                <div className="border border-dashed border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500 transition-colors bg-slate-950/50">
                  <UploadCloud className="w-4 h-4 text-purple-400 mb-0.5" />
                  <span className="text-[10px] text-slate-400 font-medium">Upload Logo</span>
                </div>
              </div>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">First Name</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Last Name</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Work Email</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@odoo.com"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Phone</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full h-11 mt-3 text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg"
              icon={UserPlus}
            >
              {loading ? 'Registering...' : 'Sign Up'}
            </Button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-purple-400 hover:text-purple-300 underline-offset-4 hover:underline">
            Sign In here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
