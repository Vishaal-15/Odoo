import { STORAGE_KEYS } from './constants';

/**
 * Maps backend API response shapes to the flat structures expected by React UI components.
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function extractItems(data) {
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
}

export function flattenEmployee(raw) {
  if (!raw) return null;
  const profile = raw.profile || {};

  return {
    id: raw.id,
    employee_id: raw.employee_id,
    email: raw.email,
    role: raw.role,
    is_active: raw.is_active ?? true,
    is_verified: raw.is_verified,
    first_name: profile.first_name ?? raw.first_name ?? '',
    last_name: profile.last_name ?? raw.last_name ?? '',
    company_name: profile.company_name ?? raw.company_name ?? 'Odoo India',
    department: profile.department ?? raw.department ?? 'General',
    job_title: profile.designation ?? raw.designation ?? raw.job_title ?? 'Employee',
    designation: profile.designation ?? raw.designation ?? raw.job_title ?? 'Employee',
    manager_name: profile.manager_name ?? raw.manager_name ?? 'Management',
    location: profile.location ?? raw.location ?? 'Bangalore Office',
    phone: profile.phone ?? raw.phone ?? '',
    address: profile.address ?? raw.address ?? '',
    avatar: profile.profile_picture_url ?? raw.profile_picture_url ?? raw.avatar ?? '',
    profile_picture_url: profile.profile_picture_url ?? raw.profile_picture_url ?? raw.avatar ?? '',
    hire_date: profile.joining_date ?? raw.joining_date ?? raw.hire_date ?? '',
    joining_date: profile.joining_date ?? raw.joining_date ?? raw.hire_date ?? '',
    salary: profile.basic_salary ?? raw.basic_salary ?? raw.salary ?? 50000,
    basic_salary: profile.basic_salary ?? raw.basic_salary ?? raw.salary ?? 50000,
    emergency_contact: profile.emergency_contact ?? raw.emergency_contact ?? '',
    
    // Resume Details
    about: profile.about ?? raw.about ?? '',
    what_i_love: profile.what_i_love ?? raw.what_i_love ?? '',
    interests_and_hobbies: profile.interests_and_hobbies ?? raw.interests_and_hobbies ?? '',
    skills: profile.skills ?? raw.skills ?? '',
    certifications: profile.certifications ?? raw.certifications ?? '',

    // Private Info
    date_of_birth: profile.date_of_birth ?? raw.date_of_birth ?? '',
    nationality: profile.nationality ?? raw.nationality ?? 'Indian',
    personal_email: profile.personal_email ?? raw.personal_email ?? '',
    gender: profile.gender ?? raw.gender ?? 'Male',
    marital_status: profile.marital_status ?? raw.marital_status ?? 'Single',
    bank_name: profile.bank_name ?? raw.bank_name ?? 'HDFC Bank',
    account_number: profile.account_number ?? raw.account_number ?? '50100234567890',
    ifsc_code: profile.ifsc_code ?? raw.ifsc_code ?? 'HDFC0001234',
    pan_no: profile.pan_no ?? raw.pan_no ?? 'ABCDE1234F',
    uan_no: profile.uan_no ?? raw.uan_no ?? '100987654321',

    status: raw.is_active === false ? 'INACTIVE' : 'ACTIVE',
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export function flattenLoginUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    employee_id: user.employee_id,
    email: user.email,
    role: user.role,
    is_verified: user.is_verified,
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    department: user.department ?? 'General',
    job_title: user.designation ?? user.job_title ?? 'Employee',
    designation: user.designation ?? user.job_title ?? 'Employee',
    is_active: true,
    status: 'ACTIVE',
  };
}

export function mapAttendanceRecord(raw, employeeLookup = {}) {
  if (!raw) return null;

  const employee = employeeLookup[raw.user_id] || {};
  const checkIn = raw.check_in_time ?? raw.check_in ?? null;
  const checkOut = raw.check_out_time ?? raw.check_out ?? null;
  const totalHours = raw.total_hours ?? raw.work_hours ?? null;

  let hoursWorked = raw.hours_worked;
  if (!hoursWorked) {
    if (checkIn && !checkOut) {
      hoursWorked = 'Active (Current Shift)';
    } else if (totalHours != null) {
      hoursWorked = `${totalHours} hrs`;
    }
  }

  return {
    ...raw,
    check_in: checkIn,
    check_out: checkOut,
    work_hours: totalHours,
    hours_worked: hoursWorked,
    employee_id: raw.employee_id ?? employee.employee_id ?? '',
    employee_name:
      raw.employee_name ??
      (employee.first_name ? `${employee.first_name} ${employee.last_name}`.trim() : ''),
  };
}

const LEAVE_TYPE_TO_BACKEND = {
  'Paid Leave': 'PAID',
  'Paid Annual Leave': 'PAID',
  PAID: 'PAID',
  'Sick Leave': 'SICK',
  'Medical / Sick Leave': 'SICK',
  SICK: 'SICK',
  'Unpaid Leave': 'UNPAID',
  UNPAID: 'UNPAID',
  'Casual Leave': 'PAID',
  'Casual Time-Off': 'PAID',
};

const LEAVE_TYPE_TO_DISPLAY = {
  PAID: 'Paid Leave',
  SICK: 'Sick Leave',
  UNPAID: 'Unpaid Leave',
};

export function mapLeaveTypeToBackend(displayType) {
  if (!displayType) return 'PAID';
  return LEAVE_TYPE_TO_BACKEND[displayType] || String(displayType).toUpperCase();
}

export function mapLeaveTypeToDisplay(backendType) {
  const value = backendType?.value ?? backendType;
  return LEAVE_TYPE_TO_DISPLAY[value] || value;
}

export function mapLeaveRecord(raw, employeeLookup = {}) {
  if (!raw) return null;

  const employee = employeeLookup[raw.user_id] || {};

  return {
    ...raw,
    leave_type: mapLeaveTypeToDisplay(raw.leave_type),
    employee_id: raw.employee_id ?? employee.employee_id ?? '',
    employee_name:
      raw.employee_name ??
      (employee.first_name ? `${employee.first_name} ${employee.last_name}`.trim() : ''),
    reviewer_comments: raw.reviewer_comments ?? raw.admin_comments ?? raw.comments ?? null,
    status: raw.status?.value ?? raw.status,
  };
}

export function mapPayrollRecord(raw) {
  if (!raw) return null;

  const month = raw.month;
  const year = raw.year;
  const payPeriod =
    raw.pay_period ??
    (month && year ? `${MONTH_NAMES[month - 1]} ${year}` : '');

  return {
    ...raw,
    pay_period: payPeriod,
    base_salary: raw.basic_salary ?? raw.base_salary ?? 0,
    payment_status: raw.payment_status?.value ?? raw.payment_status,
  };
}

export function buildEmployeeLookup(employees) {
  return Object.fromEntries(
    (employees || []).map((employee) => [employee.id, employee])
  );
}

export function isNetworkError(err) {
  return !err?.status && (err?.message?.includes('fetch') || err?.name === 'TypeError');
}

/** Use mock data ONLY on raw network disconnection failures, NEVER on 401/403 authorization errors. */
export function shouldUseMockFallback(err) {
  if (err?.status === 401 || err?.status === 403 || err?.status === 422) return false;
  return isNetworkError(err);
}

