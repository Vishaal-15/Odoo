export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  EMPLOYEE: 'EMPLOYEE',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'dayflow_auth_token',
  USER_DATA: 'dayflow_user_data',
};

export const LEAVE_TYPES = [
  { id: 'PAID', name: 'Paid Leave', maxDays: 18 },
  { id: 'SICK', name: 'Sick Leave', maxDays: 12 },
  { id: 'UNPAID', name: 'Unpaid Leave', maxDays: 30 },
  { id: 'CASUAL', name: 'Casual Leave', maxDays: 10 },
];

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HALF_DAY: 'HALF_DAY',
  LEAVE: 'LEAVE',
};

export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};
