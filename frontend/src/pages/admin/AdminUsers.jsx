import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { employeeService } from '../../services/employeeService';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Users, Search, Shield, Key, CheckCircle, XCircle, Edit } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminUsers = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editUser, setEditUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployees();
      setUsersList(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (e) => {
    e.preventDefault();
    try {
      const updated = await employeeService.updateEmployee(editUser.id, {
        role: editUser.role,
        is_active: editUser.is_active,
      });
      setUsersList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditUser(null);
      addToast('User role and access permissions updated!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update user', 'error');
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const newStatus = !targetUser.is_active;
    try {
      await employeeService.updateEmployee(targetUser.id, { is_active: newStatus });
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: newStatus } : u))
      );
      addToast(`Account ${newStatus ? 'activated' : 'deactivated'} successfully.`, 'info');
    } catch (err) {
      addToast('Failed to toggle account status', 'error');
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    return fullName.includes(term) || u.email.toLowerCase().includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>User & Access Control Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Assign system roles, grant elevated permissions, and manage authentication status
        </p>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Fetching user accounts..." />
        ) : filteredUsers.length === 0 ? (
          <EmptyState title="No users found" description="No users match the search query." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email Address</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Account Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {u.first_name} {u.last_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{u.job_title}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge status={u.role}>{u.role}</Badge>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge status={u.is_active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setEditUser({ ...u })}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Shield size={14} /> Change Role
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="btn btn-outline"
                          style={{
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.75rem',
                            borderColor: u.is_active ? 'var(--danger)' : 'var(--success)',
                            color: u.is_active ? '#f87171' : '#34d399',
                          }}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Edit Role & Permissions - ${editUser?.first_name} ${editUser?.last_name}`}
      >
        {editUser && (
          <form onSubmit={handleRoleChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Account Email
              </label>
              <input type="text" disabled value={editUser.email} style={{ width: '100%', opacity: 0.7 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                System Access Tier
              </label>
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="EMPLOYEE">EMPLOYEE (Self-Service)</option>
                <option value="HR">HR (Employee & Leave & Payroll Manager)</option>
                <option value="ADMIN">ADMIN (Full System Administrator)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setEditUser(null)} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Permissions
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
