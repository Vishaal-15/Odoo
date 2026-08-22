import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Employee Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import EmployeeProfile from '../pages/employee/EmployeeProfile';
import EmployeeAttendance from '../pages/employee/EmployeeAttendance';
import EmployeeLeave from '../pages/employee/EmployeeLeave';
import EmployeePayroll from '../pages/employee/EmployeePayroll';
import EmployeeNotifications from '../pages/employee/EmployeeNotifications';

// HR Pages
import HrDashboard from '../pages/hr/HrDashboard';
import HrEmployees from '../pages/hr/HrEmployees';
import HrAttendance from '../pages/hr/HrAttendance';
import HrLeaves from '../pages/hr/HrLeaves';
import HrPayroll from '../pages/hr/HrPayroll';
import HrNotifications from '../pages/hr/HrNotifications';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminSystem from '../pages/admin/AdminSystem';

// Shared Pages
import AnalyticsPage from '../pages/shared/AnalyticsPage';
import ReportsPage from '../pages/shared/ReportsPage';
import NotFoundPage from '../pages/shared/NotFoundPage';

// Smart Home Redirector based on user role
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'HR') return <Navigate to="/hr/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Main Application */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/profile" element={<EmployeeProfile />} />
          <Route path="/employee/attendance" element={<EmployeeAttendance />} />
          <Route path="/employee/leave" element={<EmployeeLeave />} />
          <Route path="/employee/payroll" element={<EmployeePayroll />} />
          <Route path="/employee/notifications" element={<EmployeeNotifications />} />

          {/* HR Routes (Accessible by HR & ADMIN) */}
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

          {/* Admin Dedicated Routes (Admin Only) */}
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
