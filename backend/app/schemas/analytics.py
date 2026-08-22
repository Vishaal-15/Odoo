from datetime import date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class WeeklyTrendItem(BaseModel):
    day: str
    present: int
    absent: int
    leave: int


class AttendanceTrendItem(BaseModel):
    date: date
    present_count: int
    absent_count: int
    half_day_count: int


class LeaveTypeCountItem(BaseModel):
    type: str
    count: int
    percent: float
    colorClass: Optional[str] = None
    textClass: Optional[str] = None


class LeaveBreakdownItem(BaseModel):
    leave_type: str
    count: int


class DepartmentHeadcountItem(BaseModel):
    department: str
    count: int
    lead: Optional[str] = None


class WorkforceAnalytics(BaseModel):
    totalEmployees: int
    activeEmployees: int
    departmentsCount: int
    retentionRate: str
    departmentBreakdown: List[DepartmentHeadcountItem] = []


class AttendanceAnalyticsOverview(BaseModel):
    todayPresent: int
    todayAbsent: int
    todayOnLeave: int
    averageAttendanceRate: float
    weeklyTrend: List[WeeklyTrendItem] = []


class LeaveStatsOverview(BaseModel):
    pendingApprovals: int
    approvedThisMonth: int
    rejectedThisMonth: int
    byType: List[LeaveTypeCountItem] = []


class PayrollSummaryOverview(BaseModel):
    totalPayrollExpense: float
    averageSalary: float
    pendingDisbursements: int
    nextPayDay: str


class OverviewStatsResponse(BaseModel):
    total_employees: int
    active_employees: int
    present_today: int
    absent_today: int
    on_leave_today: int
    pending_leave_requests: int
    monthly_payroll_total: float
    workforce: Optional[WorkforceAnalytics] = None
    attendance: Optional[AttendanceAnalyticsOverview] = None
    leaveStats: Optional[LeaveStatsOverview] = None
    payrollSummary: Optional[PayrollSummaryOverview] = None


class AttendanceAnalyticsResponse(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    half_day_today: int
    on_leave_today: int
    attendance_rate: float
    weekly_trend: List[WeeklyTrendItem]
    daily_trend: List[AttendanceTrendItem]


class LeaveAnalyticsResponse(BaseModel):
    total_requests: int
    pending_count: int
    approved_count: int
    rejected_count: int
    breakdown_by_type: List[LeaveTypeCountItem]
    department_stats: List[Dict[str, Any]]


class EmployeeAnalyticsResponse(BaseModel):
    total_employees: int
    active_employees: int
    inactive_employees: int
    retention_rate: str
    departments_count: int
    department_headcounts: List[DepartmentHeadcountItem]
    role_distribution: Dict[str, int]


class PayrollAnalyticsResponse(BaseModel):
    total_monthly_outlay: float
    average_salary: float
    pending_disbursements: int
    processed_count: int
    next_pay_day: str
    department_outlay: List[Dict[str, Any]]
