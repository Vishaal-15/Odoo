"""
Database Models Package
Exports all SQLAlchemy ORM models, Enums, and Base for easy access.
"""

from database.connection import Base
from database.models.enums import (
    UserRole,
    EmploymentType,
    EmployeeStatus,
    AttendanceStatus,
    LeaveStatus,
    PayrollStatus,
    NotificationType,
)
from database.models.user import User
from database.models.department import Department
from database.models.employee import Employee
from database.models.attendance import Attendance
from database.models.leave import LeaveType, LeaveRequest
from database.models.payroll import SalaryStructure, Payroll
from database.models.notification import Notification
from database.models.audit_log import AuditLog

__all__ = [
    "Base",
    # Enums
    "UserRole",
    "EmploymentType",
    "EmployeeStatus",
    "AttendanceStatus",
    "LeaveStatus",
    "PayrollStatus",
    "NotificationType",
    # Models
    "User",
    "Department",
    "Employee",
    "Attendance",
    "LeaveType",
    "LeaveRequest",
    "SalaryStructure",
    "Payroll",
    "Notification",
    "AuditLog",
]
