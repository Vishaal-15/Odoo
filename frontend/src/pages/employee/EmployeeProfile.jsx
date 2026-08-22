import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { employeeService } from '../../services/employeeService';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
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
  Edit,
  Save,
  CheckCircle2
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
        const data = await employeeService.getEmployeeById(user?.id || 3);
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

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await employeeService.updateEmployee(profile.id, editFormData);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px' }}>
      {/* Profile Banner Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Profile Avatar"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--primary-600)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {profile?.first_name} {profile?.last_name}
              </h1>
              <Badge status={profile?.role}>{profile?.role}</Badge>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
              {profile?.job_title || 'Software Engineer'} • {profile?.department || 'Engineering'}
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Employee ID: <strong>{profile?.employee_id || 'EMP-003'}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="btn btn-outline"
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <Edit size={16} /> Edit Contact Info
        </button>
      </div>

      {/* Grid: Personal & Job Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Personal Details */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="var(--primary-500)" /> Personal & Contact Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Work Email</span>
              <span style={{ fontWeight: 500 }}>{profile?.email}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Phone Number</span>
              <span style={{ fontWeight: 500 }}>{profile?.phone || '+1 (555) 018-4433'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Residential Address</span>
              <span style={{ fontWeight: 500 }}>{profile?.address || '104 Market Street, Apt 4B, San Francisco, CA'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Account Status</span>
              <Badge status={profile?.is_active ? 'ACTIVE' : 'INACTIVE'} />
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={18} color="var(--primary-500)" /> Employment & Role Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Department</span>
              <span style={{ fontWeight: 500 }}>{profile?.department || 'Software Engineering'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Job Designation</span>
              <span style={{ fontWeight: 500 }}>{profile?.job_title || 'Senior Frontend Engineer'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Joining / Hire Date</span>
              <span style={{ fontWeight: 500 }}>{formatDate(profile?.hire_date || '2023-06-12')}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Employment Type</span>
              <span style={{ fontWeight: 500 }}>Full-Time Regular</span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Structure Overview (Read-Only) */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={18} color="var(--primary-500)" /> Compensation & Salary Structure (Read-Only)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Basic Pay</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              {formatCurrency(6000)} / mo
            </div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Allowances</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)', marginTop: '4px' }}>
              {formatCurrency(2350)} / mo
            </div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Standard Deductions</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger)', marginTop: '4px' }}>
              {formatCurrency(920)} / mo
            </div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Estimated Net Salary</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-100)', marginTop: '4px' }}>
              {formatCurrency(7430)} / mo
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Documents */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="var(--primary-500)" /> Official Onboarding Documents
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sampleDocuments.map((doc, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-main)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={18} color="var(--text-muted)" />
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{doc.name}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Uploaded {formatDate(doc.date)} • {doc.size}</div>
                </div>
              </div>
              <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contact Information"
      >
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Phone Number
            </label>
            <input
              type="text"
              required
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              placeholder="+1 (555) 018-4433"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Residential Address
            </label>
            <textarea
              rows={3}
              required
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              placeholder="104 Market Street, Apt 4B, San Francisco, CA"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Profile Avatar URL
            </label>
            <input
              type="url"
              value={editFormData.avatar}
              onChange={(e) => setEditFormData({ ...editFormData, avatar: e.target.value })}
              placeholder="https://..."
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeProfile;
