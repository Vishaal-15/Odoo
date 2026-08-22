"""
Dayflow HRMS - Development Database Seed Script
Developer 3: Database + Infrastructure

Creates realistic development seed data with requested employee profiles for all entities:
- Admin: Senthil (CTO / Administrator)
- HR: Kanagaraj (Lead HR Officer)
- Employees: Vishaal, Saaral, Sharan, Sreevanth
- Departments (Engineering & Technology, Human Resources, Sales & Marketing, Finance & Operations)
- Leave Types (Paid, Sick, Casual, Unpaid)
- Salary Structures & Payroll History
- Attendance Records (Multi-day logs with check-in/out, hours & statuses)
- Leave Requests (Pending, Approved, Rejected)
- Notifications & Audit Logs

Usage:
    python -m database.seed
    or
    python database/seed.py
"""

import sys
import os
from datetime import date, datetime, time, timedelta
from decimal import Decimal
import bcrypt

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.connection import SessionLocal
from database.models import (
    User,
    Department,
    Employee,
    Attendance,
    LeaveType,
    LeaveRequest,
    SalaryStructure,
    Payroll,
    Notification,
    AuditLog,
    UserRole,
    EmploymentType,
    EmployeeStatus,
    AttendanceStatus,
    LeaveStatus,
    PayrollStatus,
    NotificationType,
)


def hash_password(plain_password: str) -> str:
    """Generates a secure bcrypt password hash."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def seed_database():
    """Seeds the database with comprehensive development data using team employee names."""
    db = SessionLocal()
    print("[Dayflow Seed] Starting database seeding...")

    try:
        # ----------------------------------------------------------------------
        # 1. Seed Leave Types
        # ----------------------------------------------------------------------
        leave_types_data = [
            {"name": "Paid Leave", "code": "PAID", "days_allowed_per_year": 18, "is_paid": True, "description": "Annual vacation and personal paid time-off"},
            {"name": "Sick Leave", "code": "SICK", "days_allowed_per_year": 12, "is_paid": True, "description": "Medical leave for illness or recovery"},
            {"name": "Casual Leave", "code": "CASUAL", "days_allowed_per_year": 10, "is_paid": True, "description": "Short unplanned personal leaves"},
            {"name": "Unpaid Leave", "code": "UNPAID", "days_allowed_per_year": 30, "is_paid": False, "description": "Extended time off without salary accrual"},
        ]

        leave_type_map = {}
        for lt_data in leave_types_data:
            lt = db.query(LeaveType).filter(LeaveType.code == lt_data["code"]).first()
            if not lt:
                lt = LeaveType(**lt_data)
                db.add(lt)
                db.flush()
            leave_type_map[lt.code] = lt
        print(f"  [+] Seeded {len(leave_types_data)} Leave Types")

        # ----------------------------------------------------------------------
        # 2. Seed Departments (initial creation without managers)
        # ----------------------------------------------------------------------
        dept_data = [
            {"name": "Engineering & Technology", "code": "ENG", "description": "Software engineering, product development, and infrastructure operations"},
            {"name": "Human Resources", "code": "HR", "description": "People operations, talent acquisition, employee relations, and payroll"},
            {"name": "Sales & Marketing", "code": "MKT", "description": "Brand marketing, client relationships, and business development"},
            {"name": "Finance & Operations", "code": "FIN", "description": "Corporate accounting, financial planning, compliance, and auditing"},
        ]

        dept_map = {}
        for d in dept_data:
            dept = db.query(Department).filter(Department.code == d["code"]).first()
            if not dept:
                dept = Department(**d)
                db.add(dept)
                db.flush()
            dept_map[dept.code] = dept
        print(f"  [+] Seeded {len(dept_data)} Departments")

        # ----------------------------------------------------------------------
        # 3. Seed Users and Employee Profiles (Senthil, Kanagaraj, Vishaal, Saaral, Sharan, Sreevanth)
        # ----------------------------------------------------------------------
        # Precomputed standard passwords:
        # Admin: Admin@123
        # HR: Hr@123
        # Employees: Employee@123
        admin_pwd = hash_password("Admin@123")
        hr_pwd = hash_password("Hr@123")
        emp_pwd = hash_password("Employee@123")

        employees_spec = [
            {
                "user": {"email": "admin@dayflow.com", "password_hash": admin_pwd, "role": UserRole.ADMIN, "is_verified": True, "is_active": True},
                "employee": {
                    "employee_code": "EMP001",
                    "first_name": "Senthil",
                    "last_name": "Kumar",
                    "email": "admin@dayflow.com",
                    "phone": "+91-98765-43210",
                    "date_of_birth": date(1985, 5, 12),
                    "gender": "Male",
                    "address": "B-402, Prestige Tech Park, Marathahalli, Bengaluru, Karnataka 560103",
                    "profile_picture_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
                    "dept_code": "ENG",
                    "designation": "Chief Technology Officer / Administrator",
                    "employment_type": EmploymentType.FULL_TIME,
                    "joining_date": date(2022, 1, 15),
                    "status": EmployeeStatus.ACTIVE,
                    "documents": {"resume": "docs/senthil_resume.pdf", "id_proof": "docs/senthil_aadhaar.pdf"},
                },
                "salary": {"base": Decimal("150000.00"), "hra": Decimal("40000.00"), "transport": Decimal("8000.00"), "medical": Decimal("5000.00"), "tax": Decimal("28000.00"), "pf": Decimal("9000.00"), "insurance": Decimal("2500.00")}
            },
            {
                "user": {"email": "hr@dayflow.com", "password_hash": hr_pwd, "role": UserRole.HR, "is_verified": True, "is_active": True},
                "employee": {
                    "employee_code": "EMP002",
                    "first_name": "Kanagaraj",
                    "last_name": "R",
                    "email": "hr@dayflow.com",
                    "phone": "+91-98765-43211",
                    "date_of_birth": date(1989, 8, 24),
                    "gender": "Male",
                    "address": "Flat 1204, Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076",
                    "profile_picture_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
                    "dept_code": "HR",
                    "designation": "Lead HR Officer",
                    "employment_type": EmploymentType.FULL_TIME,
                    "joining_date": date(2022, 3, 1),
                    "status": EmployeeStatus.ACTIVE,
                    "documents": {"resume": "docs/kanagaraj_resume.pdf", "id_proof": "docs/kanagaraj_pan.pdf"},
                },
                "salary": {"base": Decimal("95000.00"), "hra": Decimal("25000.00"), "transport": Decimal("5000.00"), "medical": Decimal("3000.00"), "tax": Decimal("16000.00"), "pf": Decimal("5700.00"), "insurance": Decimal("1800.00")}
            },
            {
                "user": {"email": "vishaal@dayflow.com", "password_hash": emp_pwd, "role": UserRole.EMPLOYEE, "is_verified": True, "is_active": True},
                "employee": {
                    "employee_code": "EMP003",
                    "first_name": "Vishaal",
                    "last_name": "S",
                    "email": "vishaal@dayflow.com",
                    "phone": "+91-98765-43212",
                    "date_of_birth": date(1998, 3, 19),
                    "gender": "Male",
                    "address": "45/A, Financial District, Gachibowli, Hyderabad, Telangana 500032",
                    "profile_picture_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
                    "dept_code": "ENG",
                    "designation": "Senior Full-Stack Engineer",
                    "employment_type": EmploymentType.FULL_TIME,
                    "joining_date": date(2023, 2, 10),
                    "status": EmployeeStatus.ACTIVE,
                    "documents": {"resume": "docs/vishaal_resume.pdf"},
                },
                "salary": {"base": Decimal("110000.00"), "hra": Decimal("28000.00"), "transport": Decimal("6000.00"), "medical": Decimal("3500.00"), "tax": Decimal("19000.00"), "pf": Decimal("6600.00"), "insurance": Decimal("2000.00")}
            },
            {
                "user": {"email": "saaral@dayflow.com", "password_hash": emp_pwd, "role": UserRole.EMPLOYEE, "is_verified": True, "is_active": True},
                "employee": {
                    "employee_code": "EMP004",
                    "first_name": "Saaral",
                    "last_name": "Varunie",
                    "email": "saaral@dayflow.com",
                    "phone": "+91-98765-43213",
                    "date_of_birth": date(1999, 11, 5),
                    "gender": "Female",
                    "address": "88, North Main Road, Koregaon Park, Pune, Maharashtra 411001",
                    "profile_picture_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
                    "dept_code": "ENG",
                    "designation": "Product UI/UX Designer",
                    "employment_type": EmploymentType.FULL_TIME,
                    "joining_date": date(2023, 6, 15),
                    "status": EmployeeStatus.ACTIVE,
                    "documents": {"portfolio": "https://saaral.design"},
                },
                "salary": {"base": Decimal("85000.00"), "hra": Decimal("22000.00"), "transport": Decimal("4500.00"), "medical": Decimal("2500.00"), "tax": Decimal("13500.00"), "pf": Decimal("5100.00"), "insurance": Decimal("1500.00")}
            },
            {
                "user": {"email": "sharan@dayflow.com", "password_hash": emp_pwd, "role": UserRole.EMPLOYEE, "is_verified": True, "is_active": True},
                "employee": {
                    "employee_code": "EMP005",
                    "first_name": "Sharan",
                    "last_name": "Kumar",
                    "email": "sharan@dayflow.com",
                    "phone": "+91-98765-43214",
                    "date_of_birth": date(1997, 7, 30),
                    "gender": "Male",
                    "address": "23, 2nd Avenue, Anna Nagar West, Chennai, Tamil Nadu 600040",
                    "profile_picture_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
                    "dept_code": "MKT",
                    "designation": "Senior Marketing Strategist",
                    "employment_type": EmploymentType.FULL_TIME,
                    "joining_date": date(2022, 9, 1),
                    "status": EmployeeStatus.ACTIVE,
                    "documents": {},
                },
                "salary": {"base": Decimal("80000.00"), "hra": Decimal("20000.00"), "transport": Decimal("4000.00"), "medical": Decimal("2500.00"), "tax": Decimal("12500.00"), "pf": Decimal("4800.00"), "insurance": Decimal("1400.00")}
            },
            {
                "user": {"email": "sreevanth@dayflow.com", "password_hash": emp_pwd, "role": UserRole.EMPLOYEE, "is_verified": True, "is_active": True},
                "employee": {
                    "employee_code": "EMP006",
                    "first_name": "Sreevanth",
                    "last_name": "R",
                    "email": "sreevanth@dayflow.com",
                    "phone": "+91-98765-43215",
                    "date_of_birth": date(1996, 12, 14),
                    "gender": "Male",
                    "address": "704, DLF Horizon, Sector 54, Golf Course Road, Gurugram, Haryana 122002",
                    "profile_picture_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
                    "dept_code": "FIN",
                    "designation": "Lead Financial Analyst",
                    "employment_type": EmploymentType.FULL_TIME,
                    "joining_date": date(2022, 5, 20),
                    "status": EmployeeStatus.ACTIVE,
                    "documents": {},
                },
                "salary": {"base": Decimal("98000.00"), "hra": Decimal("25000.00"), "transport": Decimal("5000.00"), "medical": Decimal("3000.00"), "tax": Decimal("16500.00"), "pf": Decimal("5880.00"), "insurance": Decimal("1620.00")}
            },
        ]

        employee_objects = []
        user_objects = []

        for spec in employees_spec:
            u_info = spec["user"]
            e_info = spec["employee"]
            s_info = spec["salary"]

            user = db.query(User).filter(User.email == u_info["email"]).first()
            if not user:
                user = User(
                    email=u_info["email"],
                    password_hash=u_info["password_hash"],
                    role=u_info["role"],
                    is_verified=u_info["is_verified"],
                    is_active=u_info["is_active"],
                )
                db.add(user)
                db.flush()
            else:
                user.password_hash = u_info["password_hash"]
                user.role = u_info["role"]
                user.is_verified = u_info["is_verified"]
                user.is_active = u_info["is_active"]
                db.flush()
            user_objects.append(user)

            emp = db.query(Employee).filter(Employee.employee_code == e_info["employee_code"]).first()
            if not emp:
                emp = Employee(
                    user_id=user.id,
                    employee_code=e_info["employee_code"],
                    first_name=e_info["first_name"],
                    last_name=e_info["last_name"],
                    email=e_info["email"],
                    phone=e_info["phone"],
                    date_of_birth=e_info["date_of_birth"],
                    gender=e_info["gender"],
                    address=e_info["address"],
                    profile_picture_url=e_info["profile_picture_url"],
                    department_id=dept_map[e_info["dept_code"]].id,
                    designation=e_info["designation"],
                    employment_type=e_info["employment_type"],
                    joining_date=e_info["joining_date"],
                    status=e_info["status"],
                    documents=e_info["documents"],
                )
                db.add(emp)
                db.flush()
            else:
                emp.user_id = user.id
                emp.first_name = e_info["first_name"]
                emp.last_name = e_info["last_name"]
                emp.email = e_info["email"]
                emp.phone = e_info["phone"]
                emp.address = e_info["address"]
                emp.designation = e_info["designation"]
                db.flush()
            employee_objects.append(emp)

            # Salary Structure
            total_allowances = s_info["hra"] + s_info["transport"] + s_info["medical"]
            total_deductions = s_info["tax"] + s_info["pf"] + s_info["insurance"]
            net = s_info["base"] + total_allowances - total_deductions

            sal_struct = db.query(SalaryStructure).filter(SalaryStructure.employee_id == emp.id).first()
            if not sal_struct:
                sal_struct = SalaryStructure(
                    employee_id=emp.id,
                    base_salary=s_info["base"],
                    allowances=total_allowances,
                    allowances_breakdown={
                        "hra": float(s_info["hra"]),
                        "transport": float(s_info["transport"]),
                        "medical": float(s_info["medical"]),
                    },
                    deductions=total_deductions,
                    deductions_breakdown={
                        "tax": float(s_info["tax"]),
                        "pf": float(s_info["pf"]),
                        "insurance": float(s_info["insurance"]),
                    },
                    net_salary=net,
                    effective_from=emp.joining_date,
                )
                db.add(sal_struct)
            else:
                sal_struct.base_salary = s_info["base"]
                sal_struct.allowances = total_allowances
                sal_struct.deductions = total_deductions
                sal_struct.net_salary = net

        print(f"  [+] Seeded {len(employee_objects)} Users, Employees & Salary Structures")

        # ----------------------------------------------------------------------
        # 4. Update Department Managers
        # ----------------------------------------------------------------------
        dept_map["ENG"].manager_id = employee_objects[0].id  # Senthil (CTO / Admin)
        dept_map["HR"].manager_id = employee_objects[1].id   # Kanagaraj (Lead HR Officer)
        dept_map["MKT"].manager_id = employee_objects[4].id  # Sharan (Marketing)
        dept_map["FIN"].manager_id = employee_objects[5].id  # Sreevanth (Finance)
        db.flush()
        print("  [+] Assigned Department Managers")

        # ----------------------------------------------------------------------
        # 5. Seed Attendance Records (Past 10 days for each employee)
        # ----------------------------------------------------------------------
        today = date.today()
        attendance_count = 0

        for emp in employee_objects:
            for day_offset in range(1, 11):
                att_date = today - timedelta(days=day_offset)
                # Skip weekends
                if att_date.weekday() >= 5:
                    continue

                existing_att = db.query(Attendance).filter(
                    Attendance.employee_id == emp.id,
                    Attendance.date == att_date
                ).first()

                if not existing_att:
                    # Realistic variations in attendance
                    if day_offset == 3 and emp.employee_code == "EMP003":
                        # Sick day / Leave
                        status = AttendanceStatus.LEAVE
                        check_in = None
                        check_out = None
                        hours = Decimal("0.00")
                        remarks = "Approved Sick Leave"
                    elif day_offset == 7 and emp.employee_code == "EMP004":
                        # Half day
                        status = AttendanceStatus.HALF_DAY
                        check_in = datetime.combine(att_date, time(9, 15, 0))
                        check_out = datetime.combine(att_date, time(13, 30, 0))
                        hours = Decimal("4.25")
                        remarks = "Doctor appointment in afternoon"
                    else:
                        status = AttendanceStatus.PRESENT
                        check_in = datetime.combine(att_date, time(9, 0, 0)) + timedelta(minutes=(day_offset * 3) % 25)
                        check_out = datetime.combine(att_date, time(17, 30, 0)) + timedelta(minutes=(day_offset * 5) % 45)
                        hours = Decimal("8.50")
                        remarks = "Regular workday"

                    att = Attendance(
                        employee_id=emp.id,
                        date=att_date,
                        check_in=check_in,
                        check_out=check_out,
                        work_hours=hours,
                        status=status,
                        remarks=remarks,
                    )
                    db.add(att)
                    attendance_count += 1

        db.flush()
        print(f"  [+] Seeded {attendance_count} Attendance Records")

        # ----------------------------------------------------------------------
        # 6. Seed Leave Requests
        # ----------------------------------------------------------------------
        hr_user = user_objects[1]
        admin_user = user_objects[0]

        leave_requests_spec = [
            {
                "employee_id": employee_objects[2].id,  # Vishaal
                "leave_type_code": "PAID",
                "start_date": today + timedelta(days=10),
                "end_date": today + timedelta(days=14),
                "days_count": Decimal("5.0"),
                "reason": "Annual vacation and personal travel.",
                "status": LeaveStatus.PENDING,
                "reviewed_by": None,
                "review_comments": None,
                "reviewed_at": None,
            },
            {
                "employee_id": employee_objects[3].id,  # Saaral
                "leave_type_code": "SICK",
                "start_date": today - timedelta(days=3),
                "end_date": today - timedelta(days=3),
                "days_count": Decimal("1.0"),
                "reason": "Viral fever and doctor consultation.",
                "status": LeaveStatus.APPROVED,
                "reviewed_by": hr_user.id,
                "review_comments": "Approved. Please take rest and get well soon.",
                "reviewed_at": datetime.now() - timedelta(days=3),
            },
            {
                "employee_id": employee_objects[4].id,  # Sharan
                "leave_type_code": "CASUAL",
                "start_date": today - timedelta(days=15),
                "end_date": today - timedelta(days=14),
                "days_count": Decimal("2.0"),
                "reason": "Personal family ceremony.",
                "status": LeaveStatus.APPROVED,
                "reviewed_by": hr_user.id,
                "review_comments": "Approved by HR.",
                "reviewed_at": datetime.now() - timedelta(days=16),
            },
            {
                "employee_id": employee_objects[5].id,  # Sreevanth
                "leave_type_code": "UNPAID",
                "start_date": today + timedelta(days=25),
                "end_date": today + timedelta(days=35),
                "days_count": Decimal("10.0"),
                "reason": "Executive leadership certification program.",
                "status": LeaveStatus.REJECTED,
                "reviewed_by": admin_user.id,
                "review_comments": "Cannot approve 10-day leave during Q4 statutory audit.",
                "reviewed_at": datetime.now() - timedelta(days=1),
            },
        ]

        for lr in leave_requests_spec:
            lt_id = leave_type_map[lr["leave_type_code"]].id
            existing_lr = db.query(LeaveRequest).filter(
                LeaveRequest.employee_id == lr["employee_id"],
                LeaveRequest.start_date == lr["start_date"]
            ).first()

            if not existing_lr:
                req = LeaveRequest(
                    employee_id=lr["employee_id"],
                    leave_type_id=lt_id,
                    start_date=lr["start_date"],
                    end_date=lr["end_date"],
                    days_count=lr["days_count"],
                    reason=lr["reason"],
                    status=lr["status"],
                    reviewed_by=lr["reviewed_by"],
                    review_comments=lr["review_comments"],
                    reviewed_at=lr["reviewed_at"],
                )
                db.add(req)

        print(f"  [+] Seeded {len(leave_requests_spec)} Leave Requests (Pending, Approved, Rejected)")

        # ----------------------------------------------------------------------
        # 7. Seed Payroll History (Past 2 months for all employees)
        # ----------------------------------------------------------------------
        payroll_count = 0
        current_year = today.year
        current_month = today.month

        # Generate previous 2 completed months
        months_to_seed = []
        for m_back in [2, 1]:
            m = current_month - m_back
            y = current_year
            if m <= 0:
                m += 12
                y -= 1
            months_to_seed.append((y, m))

        for emp in employee_objects:
            sal_struct = db.query(SalaryStructure).filter(SalaryStructure.employee_id == emp.id).first()
            if not sal_struct:
                continue

            for y, m in months_to_seed:
                existing_pr = db.query(Payroll).filter(
                    Payroll.employee_id == emp.id,
                    Payroll.year == y,
                    Payroll.month == m,
                ).first()

                if not existing_pr:
                    pr = Payroll(
                        employee_id=emp.id,
                        month=m,
                        year=y,
                        base_salary=sal_struct.base_salary,
                        allowances=sal_struct.allowances,
                        deductions=sal_struct.deductions,
                        net_salary=sal_struct.net_salary,
                        payment_status=PayrollStatus.PAID,
                        payment_date=date(y, m, 28),
                        payslip_url=f"/payslips/{y}/{m:02d}/payslip_{emp.employee_code}.pdf",
                        remarks=f"Salary paid for {m:02d}/{y}",
                    )
                    db.add(pr)
                    payroll_count += 1

        print(f"  [+] Seeded {payroll_count} Historical Payroll Records")

        # ----------------------------------------------------------------------
        # 8. Seed Notifications
        # ----------------------------------------------------------------------
        notifications_data = [
            {
                "user_id": user_objects[0].id,  # Senthil (Admin)
                "title": "Quarterly Security Audit Completed",
                "message": "Security compliance and audit logs for the current quarter have been synchronized.",
                "type": NotificationType.ANNOUNCEMENT,
                "is_read": True,
                "link": "/admin/audit",
            },
            {
                "user_id": user_objects[1].id,  # Kanagaraj (HR)
                "title": "New Leave Request Awaiting Review",
                "message": "Vishaal submitted a Paid Leave application for 5 days.",
                "type": NotificationType.LEAVE_STATUS,
                "is_read": False,
                "link": "/hr/leave-requests",
            },
            {
                "user_id": user_objects[2].id,  # Vishaal
                "title": "Welcome to Dayflow HRMS",
                "message": "Your profile has been fully configured. You can view attendance, salary slips, and apply for leaves.",
                "type": NotificationType.INFO,
                "is_read": True,
                "link": "/profile",
            },
            {
                "user_id": user_objects[3].id,  # Saaral
                "title": "Leave Request Approved",
                "message": "Your Sick Leave request for 1 day has been approved by HR.",
                "type": NotificationType.LEAVE_STATUS,
                "is_read": False,
                "link": "/leaves",
            },
            {
                "user_id": user_objects[2].id,  # Vishaal
                "title": "Monthly Payslip Released",
                "message": "Your monthly salary payslip has been generated and is ready for download.",
                "type": NotificationType.PAYROLL_RELEASE,
                "is_read": False,
                "link": "/payroll",
            },
        ]

        for notif_item in notifications_data:
            existing_notif = db.query(Notification).filter(
                Notification.user_id == notif_item["user_id"],
                Notification.title == notif_item["title"]
            ).first()
            if not existing_notif:
                notif = Notification(**notif_item)
                db.add(notif)

        print(f"  [+] Seeded {len(notifications_data)} Notifications")

        # ----------------------------------------------------------------------
        # 9. Seed Audit Logs
        # ----------------------------------------------------------------------
        audit_logs_data = [
            {
                "user_id": user_objects[0].id,
                "action": "SYSTEM_INITIALIZED",
                "entity_name": "system",
                "entity_id": "0",
                "details": {"event": "Dayflow HRMS Schema & Infrastructure Deployed", "version": "1.0.0"},
                "ip_address": "127.0.0.1",
            },
            {
                "user_id": user_objects[0].id,
                "action": "CREATE_EMPLOYEE",
                "entity_name": "employees",
                "entity_id": "EMP001",
                "details": {"first_name": "Senthil", "last_name": "Kumar", "role": "ADMIN"},
                "ip_address": "127.0.0.1",
            },
            {
                "user_id": user_objects[1].id,
                "action": "APPROVE_LEAVE",
                "entity_name": "leave_requests",
                "entity_id": "2",
                "details": {"employee_code": "EMP004", "status": "APPROVED", "days": 1.0},
                "ip_address": "192.168.1.45",
            },
            {
                "user_id": user_objects[1].id,
                "action": "PROCESS_PAYROLL",
                "entity_name": "payrolls",
                "entity_id": "ALL",
                "details": {"batch_month": current_month - 1, "records_processed": 6},
                "ip_address": "192.168.1.45",
            },
        ]

        for al_item in audit_logs_data:
            existing_al = db.query(AuditLog).filter(
                AuditLog.action == al_item["action"],
                AuditLog.entity_name == al_item["entity_name"],
                AuditLog.entity_id == al_item["entity_id"]
            ).first()
            if not existing_al:
                al = AuditLog(**al_item)
                db.add(al)

        print(f"  [+] Seeded {len(audit_logs_data)} Audit Logs")

        # Commit all changes
        db.commit()
        print("\n==================================================================")
        print("[Dayflow Seed] Database seeding completed successfully!")
        print("==================================================================")
        print("Development Test Credentials:")
        print("+----------------------------+----------------+--------------+")
        print("| Email                      | Password       | Role         |")
        print("+----------------------------+----------------+--------------+")
        print("| admin@dayflow.com          | Admin@123      | ADMIN        |")
        print("| hr@dayflow.com             | Hr@123         | HR           |")
        print("| vishaal@dayflow.com        | Employee@123   | EMPLOYEE     |")
        print("| saaral@dayflow.com         | Employee@123   | EMPLOYEE     |")
        print("| sharan@dayflow.com         | Employee@123   | EMPLOYEE     |")
        print("| sreevanth@dayflow.com      | Employee@123   | EMPLOYEE     |")
        print("+----------------------------+----------------+--------------+\n")

    except Exception as e:
        db.rollback()
        print(f"\n[!] [Dayflow Seed] Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
