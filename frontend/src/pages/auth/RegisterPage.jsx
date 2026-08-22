import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { UserPlus, Mail, KeyRound, User, Briefcase, Hash, Building2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
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
    department: 'Engineering',
    job_title: 'Software Developer',
  });
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
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
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
      setError(err.message || 'Registration failed. Please verify the input values.');
      addToast('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0b0f19] relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-extrabold text-lg shadow-glow-brand mb-1">
            DF
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 font-sans">
            Employee Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create an enterprise account profile in Dayflow HRMS
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Sarah"
                icon={User}
              />
              <Input
                label="Last Name"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Connor"
                icon={User}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Work Email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah@dayflow.com"
                icon={Mail}
              />
              <Input
                label="Employee ID / Code"
                name="employee_id"
                required
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="EMP045"
                icon={Hash}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                icon={Building2}
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product & Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing & Growth</option>
                <option value="Finance">Finance & Operations</option>
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

            <Input
              label="Job Designation / Title"
              name="job_title"
              required
              value={formData.job_title}
              onChange={handleChange}
              placeholder="Senior Full Stack Engineer"
              icon={Briefcase}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={KeyRound}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                icon={KeyRound}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full mt-2"
              icon={UserPlus}
            >
              {loading ? 'Submitting Registration...' : 'Complete Employee Registration'}
            </Button>
          </form>
        </div>

        {/* Login Footer */}
        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
