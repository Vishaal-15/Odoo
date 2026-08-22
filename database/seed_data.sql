-- ==============================================================================
-- Dayflow HRMS - SQL Development Seed Script
-- Developer 3: Database + Infrastructure
-- Can be executed via psql:
--   psql -U dayflow_user -d dayflow_db -f database/seed_data.sql
-- ==============================================================================

BEGIN;

-- 1. Seed Leave Types
INSERT INTO leave_types (name, code, days_allowed_per_year, is_paid, description, created_at, updated_at)
VALUES
  ('Paid Leave', 'PAID', 18, true, 'Annual vacation and personal paid time-off', NOW(), NOW()),
  ('Sick Leave', 'SICK', 12, true, 'Medical leave for illness or recovery', NOW(), NOW()),
  ('Casual Leave', 'CASUAL', 10, true, 'Short unplanned personal leaves', NOW(), NOW()),
  ('Unpaid Leave', 'UNPAID', 30, false, 'Extended time off without salary accrual', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Departments
INSERT INTO departments (name, code, description, created_at, updated_at)
VALUES
  ('Engineering & Technology', 'ENG', 'Software engineering and product development', NOW(), NOW()),
  ('Human Resources', 'HR', 'People operations and talent acquisition', NOW(), NOW()),
  ('Sales & Marketing', 'MKT', 'Brand marketing and client relationships', NOW(), NOW()),
  ('Finance & Operations', 'FIN', 'Corporate accounting and financial planning', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. Seed Users (bcrypt hashed passwords: Admin@123, Hr@123, Employee@123)
INSERT INTO users (email, password_hash, role, is_verified, is_active, created_at, updated_at)
VALUES
  ('admin@dayflow.com', '$2b$12$2w/xE4RVu1jsL38EL2fBXOO83d3qlwfvIZ7SiXoRZAvtRNnKEPIWa', 'ADMIN', true, true, NOW(), NOW()),
  ('hr@dayflow.com', '$2b$12$2w/xE4RVu1jsL38EL2fBXOO83d3qlwfvIZ7SiXoRZAvtRNnKEPIWa', 'HR', true, true, NOW(), NOW()),
  ('vishaal@dayflow.com', '$2b$12$2w/xE4RVu1jsL38EL2fBXOO83d3qlwfvIZ7SiXoRZAvtRNnKEPIWa', 'EMPLOYEE', true, true, NOW(), NOW()),
  ('saaral@dayflow.com', '$2b$12$2w/xE4RVu1jsL38EL2fBXOO83d3qlwfvIZ7SiXoRZAvtRNnKEPIWa', 'EMPLOYEE', true, true, NOW(), NOW()),
  ('sharan@dayflow.com', '$2b$12$2w/xE4RVu1jsL38EL2fBXOO83d3qlwfvIZ7SiXoRZAvtRNnKEPIWa', 'EMPLOYEE', true, true, NOW(), NOW()),
  ('sreevanth@dayflow.com', '$2b$12$2w/xE4RVu1jsL38EL2fBXOO83d3qlwfvIZ7SiXoRZAvtRNnKEPIWa', 'EMPLOYEE', true, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 4. Seed Employees
INSERT INTO employees (user_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, profile_picture_url, department_id, designation, employment_type, joining_date, status, documents, created_at, updated_at)
SELECT u.id, 'EMP001', 'Senthil', 'Kumar', 'admin@dayflow.com', '+91-98765-43210', '1985-05-12', 'Male', 'B-402, Prestige Tech Park, Marathahalli, Bengaluru, Karnataka', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', d.id, 'Chief Technology Officer / Administrator', 'FULL_TIME', '2022-01-15', 'ACTIVE', '{}', NOW(), NOW()
FROM users u, departments d WHERE u.email = 'admin@dayflow.com' AND d.code = 'ENG'
ON CONFLICT (email) DO NOTHING;

INSERT INTO employees (user_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, profile_picture_url, department_id, designation, employment_type, joining_date, status, documents, created_at, updated_at)
SELECT u.id, 'EMP002', 'Kanagaraj', 'R', 'hr@dayflow.com', '+91-98765-43211', '1989-08-24', 'Male', 'Flat 1204, Hiranandani Gardens, Powai, Mumbai, Maharashtra', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', d.id, 'Lead HR Officer', 'FULL_TIME', '2022-03-01', 'ACTIVE', '{}', NOW(), NOW()
FROM users u, departments d WHERE u.email = 'hr@dayflow.com' AND d.code = 'HR'
ON CONFLICT (email) DO NOTHING;

INSERT INTO employees (user_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, profile_picture_url, department_id, designation, employment_type, joining_date, status, documents, created_at, updated_at)
SELECT u.id, 'EMP003', 'Vishaal', 'S', 'vishaal@dayflow.com', '+91-98765-43212', '1998-03-19', 'Male', '45/A, Financial District, Gachibowli, Hyderabad, Telangana', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', d.id, 'Senior Full-Stack Engineer', 'FULL_TIME', '2023-02-10', 'ACTIVE', '{}', NOW(), NOW()
FROM users u, departments d WHERE u.email = 'vishaal@dayflow.com' AND d.code = 'ENG'
ON CONFLICT (email) DO NOTHING;

INSERT INTO employees (user_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, profile_picture_url, department_id, designation, employment_type, joining_date, status, documents, created_at, updated_at)
SELECT u.id, 'EMP004', 'Saaral', 'Varunie', 'saaral@dayflow.com', '+91-98765-43213', '1999-11-05', 'Female', '88, Koregaon Park, Pune, Maharashtra', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', d.id, 'Product UI/UX Designer', 'FULL_TIME', '2023-06-15', 'ACTIVE', '{}', NOW(), NOW()
FROM users u, departments d WHERE u.email = 'saaral@dayflow.com' AND d.code = 'ENG'
ON CONFLICT (email) DO NOTHING;

-- 5. Link Department Managers
UPDATE departments SET manager_id = (SELECT id FROM employees WHERE employee_code = 'EMP001') WHERE code = 'ENG';
UPDATE departments SET manager_id = (SELECT id FROM employees WHERE employee_code = 'EMP002') WHERE code = 'HR';

COMMIT;
