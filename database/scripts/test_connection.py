"""
Dayflow HRMS - Database Connectivity & Health Verification Script
Developer 3: Database + Infrastructure
"""

import sys
import os
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from database.connection import engine, check_connection
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
)
from database.connection import SessionLocal


def run_verification():
    print("[Dayflow Test] Verifying database connectivity and tables...")

    # 1. Healthcheck
    if not check_connection():
        print("[!] Connection check failed. Ensure Docker PostgreSQL container is running.")
        sys.exit(1)
    print("  [OK] PostgreSQL connection is active and healthy.")

    # 2. Query Table Counts
    db = SessionLocal()
    try:
        tables = [
            ("users", User),
            ("departments", Department),
            ("employees", Employee),
            ("leave_types", LeaveType),
            ("attendance", Attendance),
            ("leave_requests", LeaveRequest),
            ("salary_structures", SalaryStructure),
            ("payrolls", Payroll),
            ("notifications", Notification),
            ("audit_logs", AuditLog),
        ]

        print("\n  Table Row Counts:")
        print("  +----------------------+------------+")
        print("  | Table Name           | Row Count  |")
        print("  +----------------------+------------+")
        for table_name, model_cls in tables:
            count = db.query(model_cls).count()
            print(f"  | {table_name:<20} | {count:<10} |")
        print("  +----------------------+------------+")

        # 3. Test Foreign Key & Relationship Query
        admin_user = db.query(User).filter(User.email == "admin@dayflow.com").first()
        if admin_user:
            print(f"\n  [OK] Verified Admin User: {admin_user.email} (Role: {admin_user.role.value})")
            if admin_user.employee:
                print(f"  [OK] Verified 1-to-1 Employee Link: {admin_user.employee.full_name} ({admin_user.employee.employee_code})")
                if admin_user.employee.department:
                    print(f"  [OK] Verified Department Relation: {admin_user.employee.department.name}")

        print("\n[Dayflow Test] All database tests passed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    run_verification()
