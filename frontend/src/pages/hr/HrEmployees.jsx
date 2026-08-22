import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { employeeService } from '../../services/employeeService';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  Filter,
  Briefcase,
  Building,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const HrEmployees = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Modal states
  const [viewEmployee, setViewEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newEmployeeData, setNewEmployeeData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'EMPLOYEE',
    department: 'Software Engineering',
    job_title: 'Software Engineer',
    phone: '',
    address: '',
    hire_date: new Date().toISOString().split('T')[0],
  });

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await employeeService.createEmployee(newEmployeeData);
      setEmployees((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setNewEmployeeData({
        first_name: '',
        last_name: '',
        email: '',
        role: 'EMPLOYEE',
        department: 'Software Engineering',
        job_title: 'Software Engineer',
        phone: '',
        address: '',
        hire_date: new Date().toISOString().split('T')[0],
      });
      addToast('Employee onboarded successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to create employee', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await employeeService.updateEmployee(editEmployee.id, editEmployee);
      setEmployees((prev) => prev.map((emp) => (emp.id === updated.id ? updated : emp)));
      setEditEmployee(null);
      addToast('Employee record updated successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update employee', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.employee_id && emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const departments = ['ALL', ...new Set(employees.map((e) => e.department).filter(Boolean))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Employee Directory & Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage staff profiles, department assignments, and onboarding records
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <Plus size={18} /> Add New Employee
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
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
              placeholder="Search by name, email, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-dim)" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Fetching employee directory..." />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description="No staff members match the current search or department filter."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role & Dept</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Joined Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {/* Employee avatar & name */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={emp.first_name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {emp.employee_id || `EMP-${emp.id}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{emp.job_title || 'Staff'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{emp.department || 'General'}</div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ color: 'var(--text-muted)' }}>{emp.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{emp.phone || '—'}</div>
                    </td>

                    {/* Joined date */}
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {formatDate(emp.hire_date || '2023-01-01')}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge status={emp.is_active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setViewEmployee(emp)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          title="View Profile"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => setEditEmployee({ ...emp })}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          title="Edit Employee"
                        >
                          <Edit size={14} /> Edit
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

      {/* View Employee Modal */}
      <Modal
        isOpen={!!viewEmployee}
        onClose={() => setViewEmployee(null)}
        title="Employee Profile Details"
      >
        {viewEmployee && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <img
                src={viewEmployee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt=""
                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {viewEmployee.first_name} {viewEmployee.last_name}
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {viewEmployee.job_title} • {viewEmployee.department}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  ID: {viewEmployee.employee_id || `EMP-${viewEmployee.id}`} • Role: <Badge status={viewEmployee.role} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Email Address</span>
                <strong>{viewEmployee.email}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Phone Number</span>
                <strong>{viewEmployee.phone || '—'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Date of Joining</span>
                <strong>{formatDate(viewEmployee.hire_date)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Address</span>
                <strong>{viewEmployee.address || '—'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  const toEdit = { ...viewEmployee };
                  setViewEmployee(null);
                  setEditEmployee(toEdit);
                }}
                className="btn btn-primary"
              >
                <Edit size={14} /> Edit Profile
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Employee"
        maxWidth="600px"
      >
        <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                First Name
              </label>
              <input
                type="text"
                required
                value={newEmployeeData.first_name}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, first_name: e.target.value })}
                placeholder="Marcus"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Last Name
              </label>
              <input
                type="text"
                required
                value={newEmployeeData.last_name}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, last_name: e.target.value })}
                placeholder="Brody"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Work Email
              </label>
              <input
                type="email"
                required
                value={newEmployeeData.email}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
                placeholder="marcus@dayflow.internal"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Role
              </label>
              <select
                value={newEmployeeData.role}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, role: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR Officer</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Department
              </label>
              <input
                type="text"
                required
                value={newEmployeeData.department}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, department: e.target.value })}
                placeholder="Marketing & Growth"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                Job Title
              </label>
              <input
                type="text"
                required
                value={newEmployeeData.job_title}
                onChange={(e) => setNewEmployeeData({ ...newEmployeeData, job_title: e.target.value })}
                placeholder="Marketing Lead"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Onboarding...' : 'Onboard Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editEmployee}
        onClose={() => setEditEmployee(null)}
        title="Edit Employee Details (Admin / HR)"
        maxWidth="600px"
      >
        {editEmployee && (
          <form onSubmit={handleUpdateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={editEmployee.first_name}
                  onChange={(e) => setEditEmployee({ ...editEmployee, first_name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={editEmployee.last_name}
                  onChange={(e) => setEditEmployee({ ...editEmployee, last_name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={editEmployee.department}
                  onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={editEmployee.job_title}
                  onChange={(e) => setEditEmployee({ ...editEmployee, job_title: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Role
                </label>
                <select
                  value={editEmployee.role}
                  onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="HR">HR Officer</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Phone
                </label>
                <input
                  type="text"
                  value={editEmployee.phone || ''}
                  onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setEditEmployee(null)} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default HrEmployees;
