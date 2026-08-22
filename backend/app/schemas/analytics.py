from datetime import date
from typing import List
from pydantic import BaseModel


class OverviewStatsResponse(BaseModel):
    total_employees: int
    active_employees: int
    present_today: int
    absent_today: int
    on_leave_today: int
    pending_leave_requests: int
    monthly_payroll_total: float


class AttendanceTrendItem(BaseModel):
    date: date
    present_count: int
    absent_count: int
    half_day_count: int


class LeaveBreakdownItem(BaseModel):
    leave_type: str
    count: int


class DepartmentHeadcountItem(BaseModel):
    department: str
    count: int
