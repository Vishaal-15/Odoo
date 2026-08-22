from datetime import date, datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel


class ReportSummaryItem(BaseModel):
    id: int
    name: str
    title: str
    category: str
    type: str
    date: str
    size: str
    status: str
    format: str


class AttendanceReportRow(BaseModel):
    id: int
    employee_id: str
    employee_name: str
    department: str
    date: date
    check_in: Optional[str]
    check_out: Optional[str]
    total_hours: float
    status: str
    remarks: Optional[str]


class LeaveReportRow(BaseModel):
    id: int
    employee_id: str
    employee_name: str
    department: str
    leave_type: str
    start_date: date
    end_date: date
    days_count: float
    reason: str
    status: str
    reviewer_comments: Optional[str]
    applied_at: Optional[datetime]


class EmployeeReportRow(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    designation: str
    role: str
    joining_date: date
    basic_salary: float
    phone: Optional[str]
    status: str


class PayrollReportRow(BaseModel):
    id: int
    employee_id: str
    employee_name: str
    department: str
    month: int
    year: int
    pay_period: str
    base_salary: float
    allowances: float
    deductions: float
    net_salary: float
    payment_status: str
    payment_date: Optional[date]


class ReportExportRequest(BaseModel):
    report_type: str  # e.g., "attendance", "leave", "employees", "payroll", "Monthly Attendance", "Payroll Statement", "Leave Audit"
    format: str = "csv"  # "csv", "json"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    department: Optional[str] = None
    status: Optional[str] = None
    month: Optional[int] = None
    year: Optional[int] = None


class ReportExportResponse(BaseModel):
    report_type: str
    format: str
    filename: str
    total_records: int
    generated_at: datetime
    message: str
    content: Optional[str] = None
    download_url: Optional[str] = None
