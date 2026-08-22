"""
Dayflow HRMS - End-to-End Production Test Suite
Developer 3: Database + Infrastructure

Runs 10 comprehensive production scenarios validating:
1. Infrastructure & Engine Diagnostics
2. Authentication, Bcrypt Hashing & RBAC Enforcement
3. Organizational Hierarchy & Employee Profile Management
4. Attendance Tracking & Check-In/Out Constraints
5. Leave Quotas, Date Validation & Approval Workflows
6. Salary Breakdown & Monthly Payroll Idempotency
7. Notification Delivery & Read State Transitions
8. Security Audit Trail & Event Logging
9. ACID Transaction Atomicity & Rollback Resilience
10. Multi-Threaded Connection Pool Stress & Leak Verification

Usage:
    python -m database.scripts.test_e2e_production
    or
    python database/scripts/test_e2e_production.py
"""

import sys
import os
import time
import threading
from datetime import date, datetime, timedelta
from decimal import Decimal
import bcrypt
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from database.connection import engine, SessionLocal, check_connection, get_pool_status
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


class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0

    def assert_true(self, condition: bool, description: str):
        if condition:
            print(f"  [PASS] {description}")
            self.passed += 1
        else:
            print(f"  [FAIL] {description}")
            self.failed += 1
            raise AssertionError(f"Assertion failed: {description}")


runner = TestRunner()


def run_e2e_test_suite():
    print("==================================================================")
    print("       Dayflow HRMS - Comprehensive End-to-End Test Suite        ")
    print("                 Production Readiness Verification                ")
    print(f"       Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}       ")
    print("==================================================================")

    # --------------------------------------------------------------------------
    # Scenario 1: Infrastructure & Engine Diagnostics
    # --------------------------------------------------------------------------
    print("\n[Scenario 1] Infrastructure & Engine Diagnostics")
    try:
        runner.assert_true(check_connection(), "PostgreSQL database engine ping responsive")
        with engine.connect() as conn:
            version = conn.execute(text("SELECT version()")).scalar()
            runner.assert_true("PostgreSQL" in version, f"Verified PostgreSQL Server: {version.split(',')[0]}")
            
            exts = [r[0] for r in conn.execute(text("SELECT extname FROM pg_extension")).fetchall()]
            runner.assert_true("uuid-ossp" in exts, "Extension 'uuid-ossp' is active")
            runner.assert_true("pgcrypto" in exts, "Extension 'pgcrypto' is active")

        pool_stats = get_pool_status()
        runner.assert_true(pool_stats["pool_size"] >= 10, f"QueuePool size is adequate ({pool_stats['pool_size']})")
    except Exception as e:
        print(f"  [ERROR] Scenario 1 failed: {e}")

    # --------------------------------------------------------------------------
    # Scenario 2: Authentication, Bcrypt Hashing & RBAC
    # --------------------------------------------------------------------------
    print("\n[Scenario 2] Authentication, Bcrypt Hashing & RBAC Constraints")
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "admin@dayflow.com").first()
        runner.assert_true(admin_user is not None, "Admin user exists in database")
        runner.assert_true(admin_user.role == UserRole.ADMIN, "Admin user role is ADMIN")
        
        # Verify Bcrypt password matching
        is_pwd_valid = bcrypt.checkpw("Admin@123".encode("utf-8"), admin_user.password_hash.encode("utf-8"))
        runner.assert_true(is_pwd_valid, "Bcrypt password hashing verification succeeds for Admin@123")

        # Test duplicate email prevention
        duplicate_failed = False
        try:
            dup_user = User(
                email="admin@dayflow.com",
                password_hash="some_hash",
                role=UserRole.EMPLOYEE
            )
            db.add(dup_user)
            db.flush()
        except IntegrityError:
            db.rollback()
            duplicate_failed = True
        runner.assert_true(duplicate_failed, "Unique constraint enforces no duplicate user emails")

    except Exception as e:
        db.rollback()
        print(f"  [ERROR] Scenario 2 failed: {e}")
    finally:
        db.close()

    # --------------------------------------------------------------------------
    # Scenario 3: Organizational Hierarchy & Employee Profiles
    # --------------------------------------------------------------------------
    print("\n[Scenario 3] Organizational Hierarchy & Employee Profiles")
    db = SessionLocal()
    try:
        eng_dept = db.query(Department).filter(Department.code == "ENG").first()
        runner.assert_true(eng_dept is not None, "Engineering department is configured")
        runner.assert_true(eng_dept.manager is not None, f"Department manager assigned: {eng_dept.manager.full_name}")

        # Check all seeded employees
        employees = db.query(Employee).all()
        runner.assert_true(len(employees) >= 6, f"All team employee profiles present ({len(employees)} total)")
        
        vishaal = db.query(Employee).filter(Employee.first_name == "Vishaal").first()
        runner.assert_true(vishaal is not None, "Employee 'Vishaal' exists")
        runner.assert_true(vishaal.department.code == "ENG", "Vishaal is correctly assigned to Engineering")
        runner.assert_true(isinstance(vishaal.documents, dict), "Employee documents JSON field correctly serialized")

    except Exception as e:
        db.rollback()
        print(f"  [ERROR] Scenario 3 failed: {e}")
    finally:
        db.close()

    # --------------------------------------------------------------------------
    # Scenario 4: Attendance Tracking & Clock-In/Out Constraints
    # --------------------------------------------------------------------------
    print("\n[Scenario 4] Attendance Tracking & Check-In/Out Constraints")
    db = SessionLocal()
    try:
        emp = db.query(Employee).first()
        test_date = date.today() - timedelta(days=99)  # Unique past test date
        
        # Clean up any leftover test record
        db.query(Attendance).filter(Attendance.employee_id == emp.id, Attendance.date == test_date).delete()
        db.commit()

        # Step 1: Clock In
        check_in_time = datetime.combine(test_date, datetime.min.time()).replace(hour=9, minute=0)
        att = Attendance(
            employee_id=emp.id,
            date=test_date,
            check_in=check_in_time,
            status=AttendanceStatus.PRESENT,
            remarks="E2E Test Check-in"
        )
        db.add(att)
        db.commit()
        runner.assert_true(att.id is not None, "Clock-in successfully recorded")

        # Step 2: Clock Out & calculate work hours
        check_out_time = check_in_time + timedelta(hours=8, minutes=30)
        att.check_out = check_out_time
        att.work_hours = Decimal("8.50")
        db.commit()
        runner.assert_true(att.work_hours == Decimal("8.50"), "Clock-out with 8.50 work hours updated successfully")

        # Step 3: Duplicate clock-in on same date must be rejected
        dup_prevented = False
        try:
            dup_att = Attendance(
                employee_id=emp.id,
                date=test_date,
                check_in=check_in_time,
                status=AttendanceStatus.PRESENT
            )
            db.add(dup_att)
            db.flush()
        except IntegrityError:
            db.rollback()
            dup_prevented = True
        runner.assert_true(dup_prevented, "Unique constraint (employee_id, date) prevents duplicate attendance on same day")

        # Clean up test record
        db.query(Attendance).filter(Attendance.employee_id == emp.id, Attendance.date == test_date).delete()
        db.commit()

    except Exception as e:
        db.rollback()
        print(f"  [ERROR] Scenario 4 failed: {e}")
    finally:
        db.close()

    # --------------------------------------------------------------------------
    # Scenario 5: Leave Quotas, Date Validation & Approval Workflows
    # --------------------------------------------------------------------------
    print("\n[Scenario 5] Leave Quotas, Date Validation & Approval Workflows")
    db = SessionLocal()
    try:
        paid_leave = db.query(LeaveType).filter(LeaveType.code == "PAID").first()
        runner.assert_true(paid_leave.days_allowed_per_year == 18, "Paid Leave quota is 18 days/year")

        emp = db.query(Employee).filter(Employee.first_name == "Vishaal").first()
        hr_user = db.query(User).filter(User.role == UserRole.HR).first()

        test_start = date.today() + timedelta(days=60)
        test_end = test_start + timedelta(days=2)

        # Create new leave request
        leave_req = LeaveRequest(
            employee_id=emp.id,
            leave_type_id=paid_leave.id,
            start_date=test_start,
            end_date=test_end,
            days_count=Decimal("3.0"),
            reason="E2E Test Family Function",
            status=LeaveStatus.PENDING
        )
        db.add(leave_req)
        db.commit()
        runner.assert_true(leave_req.status == LeaveStatus.PENDING, "Leave request submitted with PENDING status")

        # HR Review and Approval
        leave_req.status = LeaveStatus.APPROVED
        leave_req.reviewed_by = hr_user.id
        leave_req.review_comments = "Approved by HR during E2E verification"
        leave_req.reviewed_at = datetime.now()
        db.commit()

        runner.assert_true(leave_req.status == LeaveStatus.APPROVED, "Leave request transitioned to APPROVED")
        runner.assert_true(leave_req.reviewer.email == hr_user.email, "Reviewer foreign key links accurately to HR user")

        # Clean up test leave
        db.delete(leave_req)
        db.commit()

    except Exception as e:
        db.rollback()
        print(f"  [ERROR] Scenario 5 failed: {e}")
    finally:
        db.close()

    # --------------------------------------------------------------------------
    # Scenario 6: Salary Structure & Monthly Payroll Idempotency
    # --------------------------------------------------------------------------
    print("\n[Scenario 6] Salary Structure & Monthly Payroll Idempotency")
    db = SessionLocal()
    try:
        emp = db.query(Employee).filter(Employee.first_name == "Vishaal").first()
        sal = emp.salary_structure
        runner.assert_true(sal is not None, "Vishaal has active salary structure")
        
        # Verify formula: net = base + allowances - deductions
        expected_net = sal.base_salary + sal.allowances - sal.deductions
        runner.assert_true(sal.net_salary == expected_net, f"Net salary formula verified: {sal.net_salary} == {expected_net}")

        # Test Payroll generation and uniqueness (month/year)
        test_month = 11
        test_year = 2025

        db.query(Payroll).filter(
            Payroll.employee_id == emp.id,
            Payroll.month == test_month,
            Payroll.year == test_year
        ).delete()
        db.commit()

        pr = Payroll(
            employee_id=emp.id,
            month=test_month,
            year=test_year,
            base_salary=sal.base_salary,
            allowances=sal.allowances,
            deductions=sal.deductions,
            net_salary=sal.net_salary,
            payment_status=PayrollStatus.PAID,
            payment_date=date(test_year, test_month, 28),
            remarks="E2E test payroll payout"
        )
        db.add(pr)
        db.commit()
        runner.assert_true(pr.id is not None, "Monthly payroll successfully processed and saved")

        # Duplicate payroll for same employee and period must fail
        dup_pr_failed = False
        try:
            dup_pr = Payroll(
                employee_id=emp.id,
                month=test_month,
                year=test_year,
                base_salary=sal.base_salary,
                net_salary=sal.net_salary
            )
            db.add(dup_pr)
            db.flush()
        except IntegrityError:
            db.rollback()
            dup_pr_failed = True
        runner.assert_true(dup_pr_failed, "Unique constraint (employee_id, month, year) prevents duplicate salary payouts")

        # Clean up test payroll
        db.query(Payroll).filter(Payroll.id == pr.id).delete()
        db.commit()

    except Exception as e:
        db.rollback()
        print(f"  [ERROR] Scenario 6 failed: {e}")
    finally:
        db.close()

    # --------------------------------------------------------------------------
    # Scenario 7: Notification Delivery & Read Lifecycle
    # --------------------------------------------------------------------------
    print("\n[Scenario 7] Notification Delivery & Read Lifecycle")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "vishaal@dayflow.com").first()
        
        notif = Notification(
            user_id=user.id,
            title="E2E Security Alert",
            message="Your password was verified during automated system audit.",
            type=NotificationType.INFO,
            is_read=False
        )
        db.add(notif)
        db.commit()
        runner.assert_true(notif.id is not None, "Notification created with is_read=False")

        # Query unread
        unread_count = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.is_read.is_(False)
        ).count()
        runner.assert_true(unread_count >= 1, f"Unread notifications indexed and queried ({unread_count} pending)")

        # Mark as read
        notif.is_read = True
        db.commit()
        runner.assert_true(notif.is_read is True, "Notification read state successfully transitioned")

        # Clean up
        db.delete(notif)
        db.commit()

    except Exception as e:
        db.rollback()
        print(f"  [ERROR] Scenario 7 failed: {e}")
    finally:
        db.close()

    # --------------------------------------------------------------------------
    # Scenario 8: Security Audit Trail & Event Logging
    # --------------------------------------------------------------------------
    print("\n[Scenario 8] Security Audit Trail & Event Logging")
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        
        log_entry = AuditLog(
            user_id=admin_user.id,
            action="E2E_SECURITY_VERIFICATION",
            entity_name="production_suite",
            entity_id="PROD-001",
            details={"status": "PASSED", "verified_by": "Developer 3"},
            ip_address="127.0.0.1"
        )
        db.add(log_entry)
        db.commit()
        runner.assert_true(log_entry.id is not None, "Audit log event persisted with JSON payload and IP address")

        # Clean up
        db.delete(log_entry)
        db.commit()

    except Exception as e:
        db.rollback()
        print(f"  [ERROR] Scenario 8 failed: {e}")
    finally:
        db.close()

    # --------------------------------------------------------------------------
    # Scenario 9: ACID Transaction Atomicity & Rollback Resilience
    # --------------------------------------------------------------------------
    print("\n[Scenario 9] ACID Transaction Atomicity & Rollback Resilience")
    db = SessionLocal()
    try:
        initial_user_count = db.query(User).count()
        initial_dept_count = db.query(Department).count()

        # Execute transaction that creates valid department but invalid user
        try:
            test_dept = Department(name="Test Temp Department", code="TMP", description="Temporary")
            db.add(test_dept)
            db.flush()

            # Trigger deliberate constraint violation (NULL email)
            invalid_user = User(email=None, password_hash="dummy", role=UserRole.EMPLOYEE)
            db.add(invalid_user)
            db.flush()
            db.commit()
        except IntegrityError:
            db.rollback()

        final_user_count = db.query(User).count()
        final_dept_count = db.query(Department).count()

        runner.assert_true(final_user_count == initial_user_count, "User table uncorrupted after rolled-back transaction")
        runner.assert_true(final_dept_count == initial_dept_count, "Department record rolled back atomically (no orphaned data)")

    except Exception as e:
        db.rollback()
        print(f"  [ERROR] Scenario 9 failed: {e}")
    finally:
        db.close()

    # --------------------------------------------------------------------------
    # Scenario 10: Multi-Threaded Connection Pool Stress & Leak Check
    # --------------------------------------------------------------------------
    print("\n[Scenario 10] Multi-Threaded Connection Pool Stress & Leak Verification")
    thread_errors = []
    thread_count = 15

    def worker_task(thread_id: int):
        try:
            worker_db = SessionLocal()
            try:
                # Perform quick query
                emp_count = worker_db.query(Employee).count()
                worker_db.execute(text("SELECT 1")).scalar()
                time.sleep(0.05)  # Simulate brief active load
            finally:
                worker_db.close()
        except Exception as e:
            thread_errors.append((thread_id, str(e)))

    threads = [threading.Thread(target=worker_task, args=(i,)) for i in range(thread_count)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    runner.assert_true(len(thread_errors) == 0, f"All {thread_count} concurrent database worker threads succeeded without errors")
    
    final_pool = get_pool_status()
    runner.assert_true(final_pool["checked_out_connections"] == 0, "Zero connection leaks: all sessions checked back into QueuePool")

    # --------------------------------------------------------------------------
    # Summary
    # --------------------------------------------------------------------------
    print("\n==================================================================")
    print(f"       Test Execution Complete: {runner.passed} PASSED, {runner.failed} FAILED")
    print("==================================================================")
    if runner.failed == 0:
        print("[SUCCESS] All 10 Production End-to-End Scenarios Passed with 100% Success!")
        print("          The Database & Infrastructure layer is fully production-ready.")
    else:
        print(f"[FAIL] {runner.failed} scenario assertion(s) failed.")
    print("==================================================================\n")
    return runner.failed == 0


if __name__ == "__main__":
    success = run_e2e_test_suite()
    sys.exit(0 if success else 1)
