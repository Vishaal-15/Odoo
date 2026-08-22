import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { employeeService } from '../../services/employeeService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Users, Search, Shield, Key, CheckCircle, XCircle, Edit, ShieldCheck } from 'lucide-react';
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
    <div className="space-y-6">
      <PageHeader
        title="User Accounts & Access Directory"
        subtitle="Configure organization credentials, grant elevated roles, and manage active account statuses"
        breadcrumbs={['Administration', 'User Directory']}
      />

      {/* Search Bar Card */}
      <Card noPadding bodyClassName="p-4">
        <div className="max-w-md">
          <Input
            placeholder="Search accounts by user name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card
        title={`Registered Accounts (${filteredUsers.length})`}
        subtitle="Manage authorization tiers and credential access"
      >
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No user accounts found"
            description="No users match your current search terms."
          />
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Department & Title</th>
                  <th>Assigned Role</th>
                  <th>Account Status</th>
                  <th>Date Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.first_name ? u.first_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{u.first_name} {u.last_name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-slate-200 text-xs">{u.job_title || 'Staff'}</div>
                      <div className="text-[11px] text-slate-400">{u.department || 'General'}</div>
                    </td>
                    <td>
                      <Badge
                        variant={u.role === 'ADMIN' ? 'warning' : u.role === 'HR' ? 'success' : 'info'}
                        size="xs"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge status={u.is_active ? 'ACTIVE' : 'INACTIVE'} size="xs" />
                    </td>
                    <td className="text-xs text-slate-400">{formatDate(u.hire_date || '2023-01-01')}</td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          onClick={() => setEditUser({ ...u })}
                          variant="ghost"
                          size="xs"
                          icon={Edit}
                        >
                          Role
                        </Button>
                        <Button
                          onClick={() => handleToggleStatus(u)}
                          variant={u.is_active ? 'danger' : 'success'}
                          size="xs"
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Role Modal */}
      <Modal
        isOpen={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        title="Modify User Authorization Tier"
        subtitle={`Update security credentials for ${editUser?.first_name} ${editUser?.last_name}`}
      >
        {editUser && (
          <form onSubmit={handleRoleChange} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Account:</div>
              <div className="font-bold text-slate-100 text-sm">{editUser.first_name} {editUser.last_name}</div>
              <div className="text-xs text-slate-400">{editUser.email}</div>
            </div>

            <Select
              label="Assigned System Role"
              value={editUser.role}
              onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
            >
              <option value="EMPLOYEE">Employee (Self-Service)</option>
              <option value="HR">HR Officer (Management & Payroll)</option>
              <option value="ADMIN">System Administrator (Root Access)</option>
            </Select>

            <div className="flex justify-end gap-2.5 pt-3">
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Apply Role Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
