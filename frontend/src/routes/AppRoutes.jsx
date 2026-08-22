import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Employee & HR Pages
import HrEmployees from '../pages/hr/HrEmployees';
import EmployeeProfile from '../pages/employee/EmployeeProfile';
import EmployeeAttendance from '../pages/employee/EmployeeAttendance';
import HrAttendance from '../pages/hr/HrAttendance';
import EmployeeLeave from '../pages/employee/EmployeeLeave';
import HrLeaves from '../pages/hr/HrLeaves';
import EmployeePayroll from '../pages/employee/EmployeePayroll';
import HrPayroll from '../pages/hr/HrPayroll';
import EmployeeNotifications from '../pages/employee/EmployeeNotifications';
import HrNotifications from '../pages/hr/HrNotifications';
import HrDashboard from '../pages/hr/HrDashboard';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminSystem from '../pages/admin/AdminSystem';

// Shared Pages
import AnalyticsPage from '../pages/shared/AnalyticsPage';
import ReportsPage from '../pages/shared/ReportsPage';
import NotFoundPage from '../pages/shared/NotFoundPage';

export const AppRoutes = () => {
  const { user } = useAuth();
  const isHrOrAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Main Application */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          
          {/* Default Odoo Landing Page: Employees Directory Kanban */}
          <Route path="/" element={<HrEmployees />} />
          <Route path="/employees" element={<HrEmployees />} />

          {/* Core Odoo Top Navigation Modules */}
          <Route 
            path="/attendance" 
            element={isHrOrAdmin ? <HrAttendance /> : <EmployeeAttendance />} 
          />
          <Route path="/time-off" element={<EmployeeLeave />} />
          <Route path="/leave" element={<EmployeeLeave />} />
          <Route path="/leaves" element={<EmployeeLeave />} />
          <Route path="/profile" element={<EmployeeProfile />} />

          {/* Employee Specific Deep-links */}
          <Route path="/employee/dashboard" element={<HrEmployees />} />
          <Route path="/employee/profile" element={<EmployeeProfile />} />
          <Route path="/employee/attendance" element={<EmployeeAttendance />} />
          <Route path="/employee/leave" element={<EmployeeLeave />} />
          <Route path="/employee/payroll" element={<EmployeePayroll />} />
          <Route path="/employee/notifications" element={<EmployeeNotifications />} />

          {/* HR & Admin Deep-links */}
          <Route element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']} />}>
            <Route path="/hr/dashboard" element={<HrDashboard />} />
            <Route path="/hr/employees" element={<HrEmployees />} />
            <Route path="/hr/attendance" element={<HrAttendance />} />
            <Route path="/hr/leaves" element={<HrLeaves />} />
            <Route path="/hr/payroll" element={<HrPayroll />} />
            <Route path="/hr/notifications" element={<HrNotifications />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Admin Console */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/system" element={<AdminSystem />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
