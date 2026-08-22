# Dayflow HRMS - API Contract & Endpoint Reference

**Document Owner**: Collaboration (Dev 1 Backend & Dev 3 Database)  
**Base URL**: `/api/v1`  
**Authentication**: HTTP Bearer JWT Token (`Authorization: Bearer <token>`)  

---

## 1. Authentication & Account APIs (Section 3.1)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register new user account (`employee_id`, `email`, `password`, `role`) | Public |
| `POST` | `/auth/login` | Authenticate user with email & password, returns JWT token | Public |
| `POST` | `/auth/verify-email` | Verify email address using token | Public |
| `GET` | `/auth/me` | Fetch authenticated user profile & role | Authenticated |

---

## 2. Employee Profile APIs (Section 3.3)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/employees` | List all employees (filterable by dept, status) | Admin / HR |
| `GET` | `/employees/{id}` | Get detailed profile of specific employee | Admin / HR / Self |
| `POST` | `/employees` | Onboard and create new employee profile | Admin / HR |
| `PUT` | `/employees/{id}` | Full profile update (Admin) or limited update (Employee: phone, address, picture) | Admin / HR / Self |
| `DELETE`| `/employees/{id}` | Deactivate employee profile | Admin |

---

## 3. Attendance APIs (Section 3.4)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendance/check-in` | Record daily clock-in for authenticated employee | Employee |
| `POST` | `/attendance/check-out` | Record clock-out and calculate daily work hours | Employee |
| `GET` | `/attendance/my-records`| Get personal daily/weekly attendance history | Employee |
| `GET` | `/attendance` | View attendance records across all employees | Admin / HR |
| `PUT` | `/attendance/{id}` | Adjust/correct attendance status or work hours | Admin / HR |

---

## 4. Leave & Time-Off APIs (Section 3.5)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/leaves/types` | List available leave types (Paid, Sick, Casual, Unpaid) | Authenticated |
| `POST` | `/leaves/apply` | Submit new leave application | Employee |
| `GET` | `/leaves/my-requests` | View personal leave requests & statuses | Employee |
| `GET` | `/leaves/all` | View all submitted leave requests | Admin / HR |
| `PUT` | `/leaves/{id}/approve` | Approve leave request with comments | Admin / HR |
| `PUT` | `/leaves/{id}/reject` | Reject leave request with reason | Admin / HR |

---

## 5. Payroll APIs (Section 3.6)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/payroll/my-payslips` | View personal historical payslips (Read-only) | Employee |
| `GET` | `/payroll/all` | View payroll list across all employees | Admin / HR |
| `POST` | `/payroll/generate` | Generate monthly payroll batch | Admin / HR |
| `PUT` | `/payroll/{id}` | Update payroll draft / mark as PAID | Admin / HR |
| `GET` | `/payroll/salary-structure/{employee_id}` | View salary breakdown for employee | Admin / HR / Self |
| `PUT` | `/payroll/salary-structure/{employee_id}` | Update salary structure & allowances/deductions | Admin |

---

## 6. Notifications & Analytics APIs (Section 6)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Fetch user notifications and unread count | Authenticated |
| `PUT` | `/notifications/{id}/read`| Mark notification as read | Authenticated |
| `GET` | `/analytics/overview` | Fetch company-wide HR analytics & KPI cards | Admin / HR |
| `GET` | `/analytics/attendance-trends` | Fetch attendance & absenteeism rate trends | Admin / HR |
| `GET` | `/analytics/payroll-distribution` | Fetch department payroll expenditure | Admin / HR |
