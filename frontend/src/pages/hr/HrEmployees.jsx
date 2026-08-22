import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { employeeService } from '../../services/employeeService';
import { attendanceService } from '../../services/attendanceService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Search,
  Plus,
  Plane,
  Building,
  CheckCircle2,
  Calendar,
  ExternalLink
} from 'lucide-react';

export const HrEmployees = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [todayAttendances, setTodayAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Modal for new employee
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newEmployeeData, setNewEmployeeData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'EMPLOYEE',
    department: 'Engineering',
    job_title: 'Software Engineer',
    phone: '',
    company_name: 'Odoo India',
    hire_date: new Date().toISOString().split('T')[0],
  });

  const isHrOrAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, attData] = await Promise.allSettled([
        employeeService.getEmployees(),
        attendanceService.getAttendance(),
      ]);
      if (empData.status === 'fulfilled') setEmployees(empData.value || []);
      if (attData.status === 'fulfilled') setTodayAttendances(attData.value || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('attendance-updated', loadData);
    const interval = setInterval(loadData, 10000); // Poll every 10s for real-time live sync
    return () => {
      window.removeEventListener('attendance-updated', loadData);
      clearInterval(interval);
    };
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
        department: 'Engineering',
        job_title: 'Software Engineer',
        phone: '',
        company_name: 'Odoo India',
        hire_date: new Date().toISOString().split('T')[0],
      });
      addToast(`Employee ${created.first_name} onboarded! Login ID: ${created.employee_id}`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to onboard employee', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Real-time status dot calculation matching Wireframe 2 (Present 🟢, On Leave ✈️, Absent 🟡)
  const getEmployeeStatusInfo = (emp) => {
    if (emp.is_active === false) {
      return { type: 'ABSENT', color: 'bg-amber-500', label: 'Deactivated' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const userAtt = todayAttendances.find((a) => 
      (a.employee_id === emp.employee_id || a.user_id === emp.id || a.employee_name?.toLowerCase() === `${emp.first_name} ${emp.last_name}`.toLowerCase()) &&
      (!a.date || a.date === todayStr)
    );

    // If checked in today
    if (userAtt && userAtt.check_in && !userAtt.check_out) {
      return { 
        type: 'PRESENT', 
        color: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse', 
        label: 'Present in Office (Checked In)' 
      };
    }
    if (userAtt && userAtt.status === 'PRESENT') {
      return { 
        type: 'PRESENT', 
        color: 'bg-emerald-500', 
        label: 'Present in Office' 
      };
    }
    if (userAtt && (userAtt.status === 'LEAVE' || userAtt.status === 'ON_LEAVE')) {
      return { 
        type: 'LEAVE', 
        isLeave: true, 
        label: 'On Approved Time Off' 
      };
    }

    return { 
      type: 'ABSENT', 
      color: 'bg-amber-400', 
      label: 'Absent / Out of Office' 
    };
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.employee_id && emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['ALL', ...new Set(employees.map((e) => e.department).filter(Boolean))];

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (Matching Wireframe 2: [+ NEW] button on left, Searchbar in center) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-md">
        
        {/* Left: [+ NEW] Button for Admin/HR */}
        {isHrOrAdmin ? (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            size="md"
            icon={Plus}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md px-5 w-full sm:w-auto"
          >
            NEW
          </Button>
        ) : (
          <div className="text-xs font-bold text-slate-400">
            Employees Directory
          </div>
        )}

        {/* Center/Right: Searchbar & Department Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1 max-w-2xl justify-end">
          <div className="w-full flex-1 relative">
            <Input
              placeholder="Search employee by name, login id, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="bg-slate-950/80 border-slate-700"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950/80 border-slate-700"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </Select>
          </div>
        </div>

      </div>

      {/* Main Kanban Cards Grid (Wireframe 2) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description="Try adjusting your search query or department filter."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEmployees.map((emp) => {
            const statusInfo = getEmployeeStatusInfo(emp);

            return (
              <div
                key={emp.id}
                onClick={() => navigate('/profile')}
                className="group bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-2xl p-5 shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer relative flex flex-col justify-between"
              >
                {/* Top-Right Status Dot Indicator (Wireframe 2: 🟢 Present, ✈️ On Leave, 🟡 Absent) */}
                <div className="absolute top-4 right-4" title={statusInfo.label}>
                  {statusInfo.isLeave ? (
                    <div className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center">
                      <Plane className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className={`w-3.5 h-3.5 rounded-full ${statusInfo.color}`} />
                    </div>
                  )}
                </div>

                {/* Card Body: Avatar, Name, Role, Login ID */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-md overflow-hidden shrink-0 border border-purple-400/30">
                    {emp.avatar ? (
                      <img src={emp.avatar} alt={emp.first_name} className="w-full h-full object-cover" />
                    ) : (
                      emp.first_name ? emp.first_name[0].toUpperCase() : 'U'
                    )}
                  </div>

                  <div className="space-y-0.5 pr-6">
                    <h3 className="font-bold text-slate-100 group-hover:text-purple-300 transition-colors text-sm line-clamp-1">
                      {emp.first_name} {emp.last_name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {emp.job_title || emp.designation || 'Staff Member'}
                    </p>
                    <p className="text-[11px] font-mono text-purple-400">
                      {emp.employee_id || `EMP-${emp.id}`}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Department & Contact */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[120px] font-medium text-slate-300">
                    {emp.department || 'General'}
                  </span>
                  <span className="text-[10px] text-purple-400 flex items-center gap-1 group-hover:underline">
                    View Profile <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Onboard New Employee */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Employee"
        subtitle="Automatic Odoo Login ID will be generated (e.g. OIJODO20230001)"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={newEmployeeData.first_name}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, first_name: e.target.value })}
              placeholder="Sarah"
            />
            <Input
              label="Last Name"
              required
              value={newEmployeeData.last_name}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, last_name: e.target.value })}
              placeholder="Connor"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email"
              type="email"
              required
              value={newEmployeeData.email}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, email: e.target.value })}
              placeholder="sarah@odoo.com"
            />
            <Input
              label="Phone Number"
              value={newEmployeeData.phone}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              value={newEmployeeData.department}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, department: e.target.value })}
            >
              <option value="Engineering">Engineering</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Finance & Operations">Finance & Operations</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product & Design">Product & Design</option>
            </Select>

            <Input
              label="Designation / Job Title"
              required
              value={newEmployeeData.job_title}
              onChange={(e) => setNewEmployeeData({ ...newEmployeeData, job_title: e.target.value })}
              placeholder="UI/UX Specialist"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Create Employee & Generate ID
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default HrEmployees;
