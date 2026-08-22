import enum


class UserRole(str, enum.Enum):
    """User roles matching Dayflow HRMS specifications."""
    ADMIN = "ADMIN"
    HR = "HR"
    EMPLOYEE = "EMPLOYEE"


class EmploymentType(str, enum.Enum):
    """Employment category."""
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    INTERN = "INTERN"


class EmployeeStatus(str, enum.Enum):
    """Employee active state."""
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    TERMINATED = "TERMINATED"
    ON_LEAVE = "ON_LEAVE"


class AttendanceStatus(str, enum.Enum):
    """Daily attendance status matching specifications."""
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    LEAVE = "LEAVE"


class LeaveStatus(str, enum.Enum):
    """Approval lifecycle state for leave requests."""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class PayrollStatus(str, enum.Enum):
    """Monthly payroll processing status."""
    DRAFT = "DRAFT"
    PROCESSED = "PROCESSED"
    PAID = "PAID"


class NotificationType(str, enum.Enum):
    """Notification classification for notifications and alerts."""
    INFO = "INFO"
    LEAVE_STATUS = "LEAVE_STATUS"
    ATTENDANCE_ALERT = "ATTENDANCE_ALERT"
    PAYROLL_RELEASE = "PAYROLL_RELEASE"
    ANNOUNCEMENT = "ANNOUNCEMENT"
