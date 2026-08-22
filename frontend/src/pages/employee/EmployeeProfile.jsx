import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { employeeService } from '../../services/employeeService';
import authService from '../../services/authService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Shield,
  FileText,
  Save,
  CheckCircle2,
  Lock,
  Plus,
  X,
  Award,
  BookOpen,
  CreditCard,
  Building2,
  Briefcase
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const EmployeeProfile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useNotification();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resume');
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    company_name: 'Odoo India',
    department: '',
    job_title: '',
    manager_name: '',
    location: 'Bangalore Office',
    joining_date: '',
    // Resume
    about: '',
    what_i_love: '',
    interests_and_hobbies: '',
    skills: '',
    certifications: '',
    // Private Info
    date_of_birth: '',
    address: '',
    nationality: 'Indian',
    personal_email: '',
    gender: 'Male',
    marital_status: 'Single',
    bank_name: 'HDFC Bank',
    account_number: '50100234567890',
    ifsc_code: 'HDFC0001234',
    pan_no: 'ABCDE1234F',
    uan_no: '100987654321',
    // Wage (Admin only)
    monthly_wage: 100000,
    working_days: 5,
    break_time: '1 hour',
  });

  // New tag inputs
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  // Password update state
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getMyProfile();
      setProfile(data);
      const basicSal = Number(data.basic_salary) || 50000;
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        email: data.email || '',
        company_name: data.company_name || 'Odoo India',
        department: data.department || 'Engineering',
        job_title: data.job_title || data.designation || 'Software Engineer',
        manager_name: data.manager_name || 'Vishaal A K',
        location: data.location || 'Bangalore Office',
        joining_date: data.joining_date || data.hire_date || '2023-01-15',
        about: data.about || 'Passionate full-stack developer dedicated to building elegant architectures and scalable cloud services.',
        what_i_love: data.what_i_love || 'Solving challenging engineering problems and crafting delightful user interfaces.',
        interests_and_hobbies: data.interests_and_hobbies || 'Open source software, reading, badminton, and photography.',
        skills: data.skills || 'Python, React, FastAPI, Docker, PostgreSQL, TailwindCSS',
        certifications: data.certifications || 'AWS Certified Solutions Architect, PostgreSQL Professional',
        date_of_birth: data.date_of_birth || '1998-05-14',
        address: data.address || '120 Market St, Bangalore, India',
        nationality: data.nationality || 'Indian',
        personal_email: data.personal_email || `${(data.first_name || 'user').toLowerCase()}.personal@gmail.com`,
        gender: data.gender || 'Male',
        marital_status: data.marital_status || 'Single',
        bank_name: data.bank_name || 'HDFC Bank',
        account_number: data.account_number || '50100234567890',
        ifsc_code: data.ifsc_code || 'HDFC0001234',
        pan_no: data.pan_no || 'ABCDE1234F',
        uan_no: data.uan_no || '100987654321',
        monthly_wage: basicSal * 2 || 100000,
        working_days: 5,
        break_time: '1 hour',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        phone: formData.phone,
        address: formData.address,
        about: formData.about,
        what_i_love: formData.what_i_love,
        interests_and_hobbies: formData.interests_and_hobbies,
        skills: formData.skills,
        certifications: formData.certifications,
        date_of_birth: formData.date_of_birth || null,
        nationality: formData.nationality,
        personal_email: formData.personal_email,
        gender: formData.gender,
        marital_status: formData.marital_status,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code,
        pan_no: formData.pan_no,
        uan_no: formData.uan_no,
      };

      const updated = await employeeService.updateMyProfile(payload);
      setProfile(updated);
      updateProfile(updated);
      addToast('Profile saved successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const currentList = formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
    if (!currentList.includes(newSkill.trim())) {
      const updated = [...currentList, newSkill.trim()].join(', ');
      setFormData((prev) => ({ ...prev, skills: updated }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const currentList = formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const updated = currentList.filter((s) => s !== skillToRemove).join(', ');
    setFormData((prev) => ({ ...prev, skills: updated }));
  };

  const handleAddCert = () => {
    if (!newCert.trim()) return;
    const currentList = formData.certifications ? formData.certifications.split(',').map((s) => s.trim()).filter(Boolean) : [];
    if (!currentList.includes(newCert.trim())) {
      const updated = [...currentList, newCert.trim()].join(', ');
      setFormData((prev) => ({ ...prev, certifications: updated }));
    }
    setNewCert('');
  };

  const handleRemoveCert = (certToRemove) => {
    const currentList = formData.certifications ? formData.certifications.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const updated = currentList.filter((c) => c !== certToRemove).join(', ');
    setFormData((prev) => ({ ...prev, certifications: updated }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    if (passwordState.newPassword.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword(passwordState.currentPassword, passwordState.newPassword);
      addToast('Password changed successfully!', 'success');
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.message || 'Failed to update password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Salary Formula Breakdown (Admin Only)
  const monthlyWage = Number(formData.monthly_wage) || 100000;
  const yearlyWage = monthlyWage * 12;
  const basicSalary = monthlyWage * 0.50; // 50% of Wage
  const hra = basicSalary * 0.50; // 50% of Basic
  const standardAllowance = 4167; // Fixed standard allowance
  const performanceBonus = basicSalary * 0.0833; // 8.33% of Basic
  const lta = basicSalary * 0.0833; // 8.33% of Basic
  const fixedAllowance = Math.max(0, monthlyWage - (basicSalary + hra + standardAllowance + performanceBonus + lta));
  const pfEmployee = basicSalary * 0.12; // 12% of Basic
  const pfEmployer = basicSalary * 0.12; // 12% of Basic
  const professionalTax = 200; // Fixed ₹200
  const netTakeHome = monthlyWage - (pfEmployee + professionalTax);

  if (loading) {
    return <LoadingSpinner message="Loading employee profile..." />;
  }

  const skillTags = formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const certTags = formData.certifications ? formData.certifications.split(',').map((c) => c.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Header Profile Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          {/* Avatar & Key Metadata */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-xl overflow-hidden border-2 border-purple-400/40">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  formData.first_name ? formData.first_name[0].toUpperCase() : 'U'
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-white">
                  {formData.first_name} {formData.last_name}
                </h1>
                <Badge variant="brand" size="xs">
                  {profile?.role || 'EMPLOYEE'}
                </Badge>
                <Badge status="ACTIVE" size="xs" />
              </div>

              <div className="text-xs text-purple-300 font-mono flex items-center gap-2">
                <span>Login ID: <strong>{profile?.employee_id || 'OI...'}</strong></span>
                <span>•</span>
                <span>{formData.job_title}</span>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-4 flex-wrap pt-0.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {formData.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {formData.phone || '+91 98765 43210'}
                </span>
              </div>
            </div>
          </div>

          {/* Org Badges */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs space-y-1.5 min-w-[200px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Company:</span>
              <span className="font-semibold text-slate-200">{formData.company_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-200">{formData.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Manager:</span>
              <span className="font-semibold text-slate-200">{formData.manager_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-semibold text-slate-200">{formData.location}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Four Odoo Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('resume')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'resume'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Resume</span>
        </button>

        <button
          onClick={() => setActiveTab('private')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'private'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Private Info</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('salary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'salary'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Salary Info (Admin)</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'security'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      
      {/* TAB 1: RESUME */}
      {activeTab === 'resume' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <Card title="Professional Background & Resume" subtitle="Your summary, passion, and core skills">
            <div className="space-y-5">
              
              {/* About */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  About
                </label>
                <Textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Share a short bio about your professional career and background..."
                />
              </div>

              {/* What I love about my job */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  What I love about my job
                </label>
                <Textarea
                  name="what_i_love"
                  value={formData.what_i_love}
                  onChange={handleChange}
                  rows={2}
                  placeholder="What motivates and inspires you in your daily work?"
                />
              </div>

              {/* My interests and hobbies */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  My interests and hobbies
                </label>
                <Textarea
                  name="interests_and_hobbies"
                  value={formData.interests_and_hobbies}
                  onChange={handleChange}
                  rows={2}
                  placeholder="What do you enjoy outside of work (e.g. photography, sports, reading)?"
                />
              </div>

              {/* Skills Tagger */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Skills & Technical Competencies
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl min-h-[44px]">
                  {skillTags.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {skillTags.length === 0 && (
                    <span className="text-xs text-slate-500 self-center">No skills added yet.</span>
                  )}
                </div>

                {/* Add Skill Input */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a new skill (e.g. React, Docker, Python)..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill} icon={Plus}>
                    Add Skill
                  </Button>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Certifications & Qualifications
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl min-h-[44px]">
                  {certTags.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    >
                      <Award className="w-3 h-3 text-indigo-400" />
                      {cert}
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(cert)}
                        className="hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {certTags.length === 0 && (
                    <span className="text-xs text-slate-500 self-center">No certifications recorded.</span>
                  )}
                </div>

                {/* Add Cert Input */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add certification (e.g. AWS Solutions Architect)..."
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCert();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddCert} icon={Plus}>
                    Add Certification
                  </Button>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-5 border-t border-slate-800 mt-6">
              <Button type="submit" variant="primary" isLoading={saving} icon={Save}>
                Save Resume Information
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 2: PRIVATE INFO */}
      {activeTab === 'private' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Details */}
            <Card title="Personal Information" subtitle="Legal identity & contact address">
              <div className="space-y-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  icon={Calendar}
                />

                <Textarea
                  label="Residing Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Street, City, Postal Code"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                  />
                  <Select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Marital Status"
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Other">Other</option>
                  </Select>

                  <Input
                    label="Personal Email"
                    name="personal_email"
                    type="email"
                    value={formData.personal_email}
                    onChange={handleChange}
                  />
                </div>

                <Input
                  label="Joining Date"
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  disabled
                />
              </div>
            </Card>

            {/* Bank & Tax Details */}
            <Card title="Bank & Statutory Details" subtitle="Payroll account, PAN, and Provident Fund info">
              <div className="space-y-4">
                <Input
                  label="Account Number"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  placeholder="50100234567890"
                />

                <Input
                  label="Bank Name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  placeholder="HDFC Bank"
                />

                <Input
                  label="IFSC Code"
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                  placeholder="HDFC0001234"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="PAN Number"
                    name="pan_no"
                    value={formData.pan_no}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                  />
                  <Input
                    label="UAN Number (PF)"
                    name="uan_no"
                    value={formData.uan_no}
                    onChange={handleChange}
                    placeholder="100987654321"
                  />
                </div>

                <Input
                  label="Emp Code"
                  value={profile?.employee_id || 'OI...'}
                  disabled
                />
              </div>
            </Card>

          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={saving} icon={Save}>
              Save Private Information
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: SALARY INFO (ADMIN ONLY) */}
      {activeTab === 'salary' && isAdmin && (
        <div className="space-y-6">
          <Card 
            title="Salary & Wage Structure (Admin Master)" 
            subtitle="Automated Odoo Indian Payroll formula engine"
          >
            {/* Input parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Monthly Wage (₹)</label>
                <input
                  type="number"
                  name="monthly_wage"
                  value={formData.monthly_wage}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-400 font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Yearly Wage (₹)</label>
                <div className="p-2 text-sm font-bold text-slate-200 bg-slate-900 border border-slate-800 rounded-lg">
                  {formatCurrency(yearlyWage)}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Working Days / Week</label>
                <div className="p-2 text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg">
                  {formData.working_days} Days / Week
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Break Time</label>
                <div className="p-2 text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg">
                  {formData.break_time}
                </div>
              </div>
            </div>

            {/* Formula Breakdown Table */}
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Salary Component</th>
                    <th>Computation Rule / Formula</th>
                    <th>Monthly Rate (₹)</th>
                    <th className="text-right">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  
                  {/* Basic Salary */}
                  <tr>
                    <td className="font-semibold text-slate-100">Basic Salary</td>
                    <td className="text-xs text-purple-300">50% of Monthly Wage</td>
                    <td className="font-mono text-slate-200">{formatCurrency(basicSalary)}</td>
                    <td className="font-mono text-right text-slate-400">{formatCurrency(basicSalary * 12)}</td>
                  </tr>

                  {/* HRA */}
                  <tr>
                    <td className="font-semibold text-slate-100">House Rent Allowance (HRA)</td>
                    <td className="text-xs text-purple-300">50% of Basic Salary</td>
                    <td className="font-mono text-slate-200">{formatCurrency(hra)}</td>
                    <td className="font-mono text-right text-slate-400">{formatCurrency(hra * 12)}</td>
                  </tr>

                  {/* Standard Allowance */}
                  <tr>
                    <td className="font-semibold text-slate-100">Standard Allowance</td>
                    <td className="text-xs text-slate-400">Fixed Statutory Standard Allowance</td>
                    <td className="font-mono text-slate-200">{formatCurrency(standardAllowance)}</td>
                    <td className="font-mono text-right text-slate-400">{formatCurrency(standardAllowance * 12)}</td>
                  </tr>

                  {/* Performance Bonus */}
                  <tr>
                    <td className="font-semibold text-slate-100">Performance Bonus</td>
                    <td className="text-xs text-purple-300">8.33% of Basic Salary</td>
                    <td className="font-mono text-slate-200">{formatCurrency(performanceBonus)}</td>
                    <td className="font-mono text-right text-slate-400">{formatCurrency(performanceBonus * 12)}</td>
                  </tr>

                  {/* LTA */}
                  <tr>
                    <td className="font-semibold text-slate-100">Leave Travel Allowance (LTA)</td>
                    <td className="text-xs text-purple-300">8.33% of Basic Salary</td>
                    <td className="font-mono text-slate-200">{formatCurrency(lta)}</td>
                    <td className="font-mono text-right text-slate-400">{formatCurrency(lta * 12)}</td>
                  </tr>

                  {/* Fixed Allowance (Balancing Figure) */}
                  <tr>
                    <td className="font-semibold text-slate-100">Fixed Allowance</td>
                    <td className="text-xs text-amber-300">Balancing Figure (Wage − Components)</td>
                    <td className="font-mono text-slate-200">{formatCurrency(fixedAllowance)}</td>
                    <td className="font-mono text-right text-slate-400">{formatCurrency(fixedAllowance * 12)}</td>
                  </tr>

                  {/* Total Gross */}
                  <tr className="bg-purple-950/20 font-bold">
                    <td className="text-purple-200">Total Gross Wage</td>
                    <td className="text-xs text-purple-400">Sum of all allowances</td>
                    <td className="font-mono text-purple-200">{formatCurrency(monthlyWage)}</td>
                    <td className="font-mono text-right text-purple-300">{formatCurrency(yearlyWage)}</td>
                  </tr>

                  {/* Deductions: PF */}
                  <tr>
                    <td className="font-semibold text-rose-300">Provident Fund (PF) Employee</td>
                    <td className="text-xs text-rose-400">12% of Basic Salary (Statutory)</td>
                    <td className="font-mono text-rose-300">-{formatCurrency(pfEmployee)}</td>
                    <td className="font-mono text-right text-rose-400">-{formatCurrency(pfEmployee * 12)}</td>
                  </tr>

                  {/* Deductions: Professional Tax */}
                  <tr>
                    <td className="font-semibold text-rose-300">Professional Tax (PT)</td>
                    <td className="text-xs text-rose-400">Fixed Statutory State PT</td>
                    <td className="font-mono text-rose-300">-{formatCurrency(professionalTax)}</td>
                    <td className="font-mono text-right text-rose-400">-{formatCurrency(professionalTax * 12)}</td>
                  </tr>

                  {/* Employer PF Contribution */}
                  <tr className="text-slate-400 text-xs">
                    <td>Employer PF Contribution</td>
                    <td>12% of Basic Salary (Direct Employer Cost)</td>
                    <td className="font-mono">{formatCurrency(pfEmployer)}</td>
                    <td className="font-mono text-right">{formatCurrency(pfEmployer * 12)}</td>
                  </tr>

                  {/* Net Take Home */}
                  <tr className="bg-emerald-950/30 text-emerald-300 font-black text-sm">
                    <td>Net Take-Home Pay (Monthly)</td>
                    <td className="text-xs font-normal">Gross Wage − (Employee PF + PT)</td>
                    <td className="font-mono text-emerald-400">{formatCurrency(netTakeHome)}</td>
                    <td className="font-mono text-right text-emerald-300">{formatCurrency(netTakeHome * 12)}</td>
                  </tr>

                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-300">
              💡 <strong>Statutory Compliance Note:</strong> In accordance with Indian payroll regulations, attendance records directly determine payable days each month. Unpaid time-off records automatically deduct from total payable days.
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: SECURITY */}
      {activeTab === 'security' && (
        <div className="max-w-xl">
          <Card title="Account Security & Password" subtitle="Update your workspace account password">
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                required
                value={passwordState.currentPassword}
                onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                placeholder="••••••••"
                icon={Lock}
              />

              <Input
                label="New Password"
                type="password"
                required
                value={passwordState.newPassword}
                onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                placeholder="Minimum 8 characters"
                icon={Lock}
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                value={passwordState.confirmPassword}
                onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                icon={Lock}
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" isLoading={passwordLoading} icon={Shield}>
                  Update Account Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};

export default EmployeeProfile;
