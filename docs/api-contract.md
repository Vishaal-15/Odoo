# Dayflow HRMS - API Contract

Base URL: `/api/v1`

All authenticated endpoints require header:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 1. Authentication & User (`/auth`)

### `POST /auth/register`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "employee_id": "EMP1001",
    "email": "alex@company.com",
    "password": "SecurePassword123!",
    "role": "EMPLOYEE", // Optional: "EMPLOYEE", "HR", "ADMIN" (default: EMPLOYEE)
    "first_name": "Alex",
    "last_name": "Morgan",
    "department": "Engineering",
    "designation": "Software Engineer",
    "phone": "+1234567890"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 1,
    "employee_id": "EMP1001",
    "email": "alex@company.com",
    "role": "EMPLOYEE",
    "is_active": true,
    "created_at": "2026-08-22T04:00:00Z",
    "profile": {
      "first_name": "Alex",
      "last_name": "Morgan",
      "department": "Engineering",
      "designation": "Software Engineer",
      "phone": "+1234567890",
      "address": null,
      "profile_picture_url": null,
      "joining_date": "2026-08-22",
      "basic_salary": 0.0
    }
  }
  ```

### `POST /auth/login`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "alex@company.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "employee_id": "EMP1001",
      "email": "alex@company.com",
      "role": "EMPLOYEE",
      "first_name": "Alex",
      "last_name": "Morgan",
      "department": "Engineering"
    }
  }
  ```

### `GET /auth/me`
- **Auth**: Authenticated (Any role)
- **Response**: `200 OK` - Returns currently authenticated user with complete profile.

---

## 2. Employee Profile Management (`/employees`)

### `GET /employees/me`
- **Auth**: Authenticated (Employee)
- **Response**: `200 OK` - Returns logged in employee's profile and job details.

### `PATCH /employees/me`
- **Auth**: Authenticated (Employee)
- **Request Body** (Limited fields editable by employee):
  ```json
  {
    "phone": "+1987654321",
    "address": "456 Market St, San Francisco, CA",
    "profile_picture_url": "https://example.com/avatar.jpg",
    "emergency_contact": "+15554443333"
  }
  ```
- **Response**: `200 OK` - Updated user profile.

### `GET /employees`
- **Auth**: `HR`, `ADMIN`
- **Query Params**: `skip` (int, default 0), `limit` (int, default 50), `department` (string), `role` (string), `search` (string)
- **Response**: `200 OK`
  ```json
  {
    "total": 25,
    "items": [ ... ]
  }
  ```

### `GET /employees/{id}`
- **Auth**: `HR`, `ADMIN` (or `EMPLOYEE` if requesting own ID)
- **Response**: `200 OK` - Detailed employee profile.

### `PATCH /employees/{id}`
- **Auth**: `HR`, `ADMIN`
- **Request Body**:
  ```json
  {
    "first_name": "Alexander",
    "department": "Senior Engineering",
    "designation": "Staff Engineer",
    "role": "HR",
    "basic_salary": 95000.00,
    "is_active": true
  }
  ```
- **Response**: `200 OK` - Updated employee profile.

---

## 3. Attendance Management (`/attendance`)

### `POST /attendance/check-in`
- **Auth**: Authenticated (`EMPLOYEE`, `HR`, `ADMIN`)
- **Request Body** (Optional):
  ```json
  {
    "remarks": "Working from office"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 10,
    "user_id": 1,
    "date": "2026-08-22",
    "check_in_time": "2026-08-22T09:00:00Z",
    "check_out_time": null,
    "total_hours": 0.0,
    "status": "PRESENT",
    "remarks": "Working from office"
  }
  ```
- **Error Codes**: `400 Bad Request` if already checked in today.

### `POST /attendance/check-out`
- **Auth**: Authenticated (`EMPLOYEE`, `HR`, `ADMIN`)
- **Request Body** (Optional):
  ```json
  {
    "remarks": "Completed day tasks"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "id": 10,
    "user_id": 1,
    "date": "2026-08-22",
    "check_in_time": "2026-08-22T09:00:00Z",
    "check_out_time": "2026-08-22T17:30:00Z",
    "total_hours": 8.5,
    "status": "PRESENT",
    "remarks": "Completed day tasks"
  }
  ```

### `GET /attendance/me`
- **Auth**: Authenticated (`EMPLOYEE`, `HR`, `ADMIN`)
- **Query Params**: `start_date` (date, YYYY-MM-DD), `end_date` (date, YYYY-MM-DD)
- **Response**: `200 OK` - List of personal attendance records.

### `GET /attendance/me/today`
- **Auth**: Authenticated (`EMPLOYEE`, `HR`, `ADMIN`)
- **Response**: `200 OK` - Today's check-in/out record or null.

### `GET /attendance`
- **Auth**: `HR`, `ADMIN`
- **Query Params**: `user_id` (int), `date` (date), `start_date` (date), `end_date` (date), `status` (string), `skip`, `limit`
- **Response**: `200 OK` - List of all employees' attendance records.

### `GET /attendance/summary`
- **Auth**: `HR`, `ADMIN`
- **Query Params**: `date` (default: today)
- **Response**: `200 OK`
  ```json
  {
    "total_employees": 50,
    "present_today": 42,
    "absent_today": 5,
    "on_leave_today": 3,
    "checked_in_active": 12
  }
  ```

---

## 4. Leave & Time-Off Management (`/leaves`)

### `POST /leaves`
- **Auth**: Authenticated (`EMPLOYEE`, `HR`, `ADMIN`)
- **Request Body**:
  ```json
  {
    "leave_type": "PAID", // "PAID", "SICK", "UNPAID"
    "start_date": "2026-08-25",
    "end_date": "2026-08-27",
    "reason": "Family vacation"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 5,
    "user_id": 1,
    "leave_type": "PAID",
    "start_date": "2026-08-25",
    "end_date": "2026-08-27",
    "days_count": 3,
    "reason": "Family vacation",
    "status": "PENDING",
    "reviewer_id": null,
    "reviewer_comments": null,
    "created_at": "2026-08-22T04:10:00Z"
  }
  ```

### `GET /leaves/me`
- **Auth**: Authenticated (`EMPLOYEE`, `HR`, `ADMIN`)
- **Query Params**: `status` (PENDING, APPROVED, REJECTED)
- **Response**: `200 OK` - Array of current user's leave requests.

### `GET /leaves`
- **Auth**: `HR`, `ADMIN`
- **Query Params**: `status`, `user_id`, `skip`, `limit`
- **Response**: `200 OK` - Array of all company leave requests.

### `GET /leaves/{id}`
- **Auth**: Authenticated (Self or `HR`/`ADMIN`)
- **Response**: `200 OK` - Leave request details.

### `PATCH /leaves/{id}/status`
- **Auth**: `HR`, `ADMIN`
- **Request Body**:
  ```json
  {
    "status": "APPROVED", // "APPROVED" or "REJECTED"
    "reviewer_comments": "Approved. Have a great vacation!"
  }
  ```
- **Response**: `200 OK` - Updated leave request.

### `DELETE /leaves/{id}`
- **Auth**: Authenticated (Owner of pending leave)
- **Response**: `204 No Content` - Cancels pending leave.

---

## 5. Payroll Management (`/payroll`)

### `GET /payroll/me`
- **Auth**: Authenticated (`EMPLOYEE`, `HR`, `ADMIN`)
- **Query Params**: `year` (int)
- **Response**: `200 OK` - Array of salary slips for current user.

### `GET /payroll`
- **Auth**: `HR`, `ADMIN`
- **Query Params**: `month` (1-12), `year` (int), `payment_status`, `skip`, `limit`
- **Response**: `200 OK` - Array of payroll records for all employees.

### `POST /payroll`
- **Auth**: `HR`, `ADMIN`
- **Request Body**:
  ```json
  {
    "user_id": 1,
    "month": 8,
    "year": 2026,
    "basic_salary": 8000.00,
    "allowances": 1200.00,
    "deductions": 400.00,
    "payment_status": "PROCESSED",
    "payment_date": "2026-08-31",
    "remarks": "August 2026 Salary"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 12,
    "user_id": 1,
    "month": 8,
    "year": 2026,
    "basic_salary": 8000.00,
    "allowances": 1200.00,
    "deductions": 400.00,
    "net_salary": 8800.00,
    "payment_status": "PROCESSED",
    "payment_date": "2026-08-31",
    "remarks": "August 2026 Salary"
  }
  ```

### `GET /payroll/{id}`
- **Auth**: Authenticated (Self or `HR`/`ADMIN`)
- **Response**: `200 OK` - Detailed payroll slip.

### `PATCH /payroll/{id}`
- **Auth**: `HR`, `ADMIN`
- **Request Body**: Partial update of payroll fields (basic_salary, allowances, deductions, payment_status, payment_date).
- **Response**: `200 OK` - Updated payroll record.

---

## 6. Notifications (`/notifications`)

### `GET /notifications`
- **Auth**: Authenticated
- **Query Params**: `unread_only` (bool, default false), `limit` (int, default 20)
- **Response**: `200 OK`
  ```json
  {
    "unread_count": 2,
    "items": [
      {
        "id": 1,
        "title": "Leave Approved",
        "message": "Your leave request for 2026-08-25 has been approved.",
        "type": "LEAVE",
        "is_read": false,
        "created_at": "2026-08-22T05:00:00Z"
      }
    ]
  }
  ```

### `PATCH /notifications/{id}/read`
- **Auth**: Authenticated (Recipient)
- **Response**: `200 OK` - Marked notification as read.

### `PATCH /notifications/read-all`
- **Auth**: Authenticated
- **Response**: `200 OK` - Marks all current user notifications as read.

---

## 7. Analytics & Reports Support (`/analytics`)

### `GET /analytics/overview`
- **Auth**: `HR`, `ADMIN`
- **Response**: `200 OK`
  ```json
  {
    "total_employees": 45,
    "active_employees": 44,
    "present_today": 38,
    "absent_today": 4,
    "on_leave_today": 2,
    "pending_leave_requests": 6,
    "monthly_payroll_total": 352000.00
  }
  ```

### `GET /analytics/attendance-trends`
- **Auth**: `HR`, `ADMIN`
- **Query Params**: `days` (int, default 7)
- **Response**: `200 OK` - Daily trend stats.

### `GET /analytics/leave-breakdown`
- **Auth**: `HR`, `ADMIN`
- **Response**: `200 OK` - Count of leaves by type and status.
