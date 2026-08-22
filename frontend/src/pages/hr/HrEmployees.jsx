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
  Calendar,
  Building2,
  CheckCircle2,
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
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory & Staff Records"
        subtitle="Manage company staff profiles, department assignments, and onboarding records"
        breadcrumbs={['HR Operations', 'Employee Records']}
        actions={
          <Button onClick={() => setIsAddModalOpen(true)} variant="primary" size="sm" icon={Plus}>
            Onboard New Employee
          </Button>
        }
      />

      {/* Filter and Search Bar Card */}
      <Card noPadding bodyClassName="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search by employee name, work email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>

          <div className="w-full sm:w-64">
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              icon={Filter}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Employee List Table */}
      <Card
        title={`Staff Roster (${filteredEmployees.length})`}
        subtitle="Active staff profiles and organizational roles"
      >
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description="No staff members match the current search query or department filter."
          />
        ) : (
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role & Department</th>
                  <th>Contact</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    {/* Avatar & Name */}
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={emp.first_name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700/60 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-100">
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {emp.employee_id || `EMP-${emp.id}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td>
                      <div className="font-medium text-slate-200">{emp.job_title || 'Staff'}</div>
                      <div className="text-xs text-slate-400">{emp.department || 'General'}</div>
                    </td>

                    {/* Contact */}
                    <td>
                      <div className="text-xs text-slate-300">{emp.email}</div>
                      <div className="text-[11px] text-slate-500">{emp.phone || '—'}</div>
                    </td>

                    {/* Date */}
                    <td className="text-xs text-slate-400">
                      {formatDate(emp.hire_date || '2023-01-01')}
                    </td>

                    {/* Status */}
                    <td>
                      <Badge status={emp.is_active ? 'ACTIVE' : 'INACTIVE'} size="xs" />
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          onClick={() => setViewEmployee(emp)}
                          variant="ghost"
                          size="xs"
                          icon={Eye}
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => setEditEmployee({ ...emp })}
                          variant="ghost"
                          size="xs"
                          icon={Edit}
                        >
                          Edit
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

      {/* View Employee Modal */}
      <Modal
        isOpen={Boolean(viewEmployee)}
        onClose={() => setViewEmployee(null)}
        title="Employee Profile Card"
        subtitle="Detailed staff credentials & contact records"
      >
        {viewEmployee && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <img
                src={viewEmployee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt=""
                className="w-14 h-14 rounded-xl object-cover border border-slate-700/60"
              />
              <div className="space-y-1">
                <div className="text-lg font-bold text-slate-100 font-sans">
                  {viewEmployee.first_name} {viewEmployee.last_name}
                </div>
                <div className="text-xs text-slate-400">
                  {viewEmployee.job_title} • {viewEmployee.department}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>ID: <strong className="text-slate-200">{viewEmployee.employee_id || `EMP-${viewEmployee.id}`}</strong></span>
                  <span>•</span>
                  <Badge status={viewEmployee.role} size="xs" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-500 block text-xs">Work Email</span>
                <span className="font-semibold text-slate-200">{viewEmployee.email}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-500 block text-xs">Phone Number</span>
                <span className="font-semibold text-slate-200">{viewEmployee.phone || '—'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-500 block text-xs">Date of Joining</span>
                <span className="font-semibold text-slate-200">{formatDate(viewEmployee.hire_date)}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-500 block text-xs">Residential Address</span>
                <span className="font-semibold text-slate-200">{viewEmployee.address || '—'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="primary"
                icon={Edit}
                size="sm"
                onClick={() => {
                  const toEdit = { ...viewEmployee };
                  setViewEmployee(null);
                  setEditEmployee(toEdit);
                }}
              >
                Edit Staff Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Employee"
        subtitle="Add a staff profile to the organization database"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={newEmployeeData.first_name}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, first_name: e.target.value })}
              placeholder="Marcus"
            />
            <Input
              label="Last Name"
              required
              value={newEmployeeData.last_name}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, last_name: e.target.value })}
              placeholder="Brody"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email"
              type="email"
              required
              value={newEmployeeData.email}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
              placeholder="marcus@dayflow.com"
            />
            <Select
              label="Role"
              value={newEmployeeData.role}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, role: e.target.value })}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="HR">HR Officer</option>
              <option value="ADMIN">System Administrator</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department"
              required
              value={newEmployeeData.department}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, department: e.target.value })}
              placeholder="Marketing & Growth"
            />
            <Input
              label="Job Title"
              required
              value={newEmployeeData.job_title}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, job_title: e.target.value })}
              placeholder="Marketing Lead"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Onboard Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={Boolean(editEmployee)}
        onClose={() => setEditEmployee(null)}
        title="Edit Employee Details"
        subtitle="Update employee role, department, and contact information"
      >
        {editEmployee && (
          <form onSubmit={handleUpdateEmployee} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                required
                value={editEmployee.first_name}
                onChange={(e) => setEditEmployee({ ...editEmployee, first_name: e.target.value })}
              />
              <Input
                label="Last Name"
                required
                value={editEmployee.last_name}
                onChange={(e) => setEditEmployee({ ...editEmployee, last_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Department"
                required
                value={editEmployee.department}
                onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
              />
              <Input
                label="Job Title"
                required
                value={editEmployee.job_title}
                onChange={(e) => setEditEmployee({ ...editEmployee, job_title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Role"
                value={editEmployee.role}
                onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value })}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR Officer</option>
                <option value="ADMIN">System Administrator</option>
              </Select>
              <Input
                label="Phone"
                value={editEmployee.phone || ''}
                onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <Button type="button" variant="outline" onClick={() => setEditEmployee(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default HrEmployees;
