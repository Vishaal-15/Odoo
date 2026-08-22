import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { employeeService } from '../../services/employeeService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Edit3,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const EmployeeProfile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useNotification();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    phone: '',
    address: '',
    avatar: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await employeeService.getMyProfile();
        setProfile(data);
        setEditFormData({
          phone: data?.phone || '',
          address: data?.address || '',
          avatar: data?.avatar || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await employeeService.updateMyProfile(editFormData);
      setProfile((prev) => ({ ...prev, ...updated }));
      updateProfile(updated);
      setIsEditModalOpen(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading employee profile..." />;
  }

  const sampleDocuments = [
    { name: 'Employment Offer Letter', date: '2023-06-10', type: 'PDF', size: '240 KB' },
    { name: 'Identity & Tax Declaration', date: '2023-06-12', type: 'PDF', size: '512 KB' },
    { name: 'NDA & Ethics Agreement', date: '2023-06-12', type: 'PDF', size: '180 KB' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Employee Profile"
        subtitle="Manage your personal details, employment records, and tax forms"
        breadcrumbs={['Workspace', 'My Profile']}
        actions={
          <Button onClick={() => setIsEditModalOpen(true)} size="sm" variant="secondary" icon={Edit3}>
            Edit Contact Details
          </Button>
        }
      />

      {/* Main Profile Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-brand-950/30 border border-slate-800 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt="Profile Avatar"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500/40 shadow-glow-brand"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <Badge variant="brand" size="xs">
                {profile?.role || 'EMPLOYEE'}
              </Badge>
              <Badge status={profile?.status || 'ACTIVE'} size="xs" />
            </div>

            <p className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-2">
              <span>{profile?.job_title || 'Software Engineer'}</span>
              <span>•</span>
              <span className="text-slate-300">{profile?.department || 'Engineering'}</span>
            </p>

            <p className="text-xs text-slate-400 font-mono">
              Employee ID: <span className="text-brand-300 font-semibold">{profile?.employee_id || 'EMP003'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Split Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Contact Card */}
        <Card title="Personal & Contact Information" headerIcon={User}>
          <dl className="divide-y divide-slate-800/80 text-xs sm:text-sm">
            <div className="py-3 flex justify-between items-center">
              <dt className="text-slate-400 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" /> Email Address
              </dt>
              <dd className="font-semibold text-slate-200">{profile?.email}</dd>
            </div>
            <div className="py-3 flex justify-between items-center">
              <dt className="text-slate-400 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" /> Mobile Phone
              </dt>
              <dd className="font-semibold text-slate-200">{profile?.phone || '+1-555-0199'}</dd>
            </div>
            <div className="py-3 flex justify-between items-start">
              <dt className="text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" /> Residential Address
              </dt>
              <dd className="font-semibold text-slate-200 text-right max-w-xs">
                {profile?.address || '120 Market St, San Francisco, CA'}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Job & Compensation Details */}
        <Card title="Employment & Compensation" headerIcon={Briefcase}>
          <dl className="divide-y divide-slate-800/80 text-xs sm:text-sm">
            <div className="py-3 flex justify-between items-center">
              <dt className="text-slate-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" /> Department Division
              </dt>
              <dd className="font-semibold text-slate-200">{profile?.department || 'Engineering'}</dd>
            </div>
            <div className="py-3 flex justify-between items-center">
              <dt className="text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" /> Hire / Joining Date
              </dt>
              <dd className="font-semibold text-slate-200">{formatDate(profile?.hire_date || '2023-01-15')}</dd>
            </div>
            <div className="py-3 flex justify-between items-center">
              <dt className="text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-500" /> Base Annual Salary
              </dt>
              <dd className="font-semibold text-emerald-400">{formatCurrency(profile?.salary || 95000)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Employment Documents */}
      <Card title="Employee Documents & Agreements" subtitle="Official compliance files" headerIcon={FileText}>
        <div className="divide-y divide-slate-800/80">
          {sampleDocuments.map((doc, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 text-brand-400 border border-slate-700/60 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-200">{doc.name}</div>
                  <div className="text-[11px] text-slate-500">Uploaded {formatDate(doc.date)} • {doc.size}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => addToast(`Opening ${doc.name}...`, 'info')}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300"
              >
                Download {doc.type}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contact Information"
        subtitle="Update your phone, address, and profile avatar URL"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Phone Number"
            value={editFormData.phone}
            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            placeholder="+1-555-0199"
            icon={Phone}
          />

          <Textarea
            label="Home / Residential Address"
            value={editFormData.address}
            onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
            placeholder="120 Market St, San Francisco, CA"
            rows={3}
          />

          <Input
            label="Avatar Photo URL"
            value={editFormData.avatar}
            onChange={(e) => setEditFormData({ ...editFormData, avatar: e.target.value })}
            placeholder="https://..."
            icon={User}
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeProfile;
