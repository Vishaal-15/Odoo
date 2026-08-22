from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import require_hr
from app.models.user import User, EmployeeProfile
from app.models.attendance import Attendance, AttendanceStatus
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.payroll import Payroll
from app.schemas.analytics import (
    OverviewStatsResponse,
    AttendanceTrendItem,
    LeaveBreakdownItem,
    DepartmentHeadcountItem,
)
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.leave_repository import LeaveRepository
from app.repositories.payroll_repository import PayrollRepository

router = APIRouter(prefix="/analytics", tags=["Analytics & Reporting Support"])


@router.get(
    "/overview",
    response_model=OverviewStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get HR/Admin dashboard summary metrics",
)
def get_analytics_overview(
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated KPIs for the executive/HR dashboard.
    """
    today = date.today()
    total_emp = db.query(User).count()
    active_emp = db.query(User).filter(User.is_active == True).count()
    
    present_today = db.query(Attendance).filter(
        Attendance.date == today,
        Attendance.status.in_([AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY]),
    ).count()
    
    on_leave_today = db.query(LeaveRequest).filter(
        LeaveRequest.status == LeaveStatus.APPROVED,
        LeaveRequest.start_date <= today,
        LeaveRequest.end_date >= today,
    ).count()
    
    absent_today = max(0, total_emp - (present_today + on_leave_today))
    pending_leaves = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.PENDING).count()
    
    # Calculate current month's payroll total
    payroll_repo = PayrollRepository(db)
    monthly_payroll = payroll_repo.get_monthly_total_expense(today.month, today.year)

    return {
        "total_employees": total_emp,
        "active_employees": active_emp,
        "present_today": present_today,
        "absent_today": absent_today,
        "on_leave_today": on_leave_today,
        "pending_leave_requests": pending_leaves,
        "monthly_payroll_total": monthly_payroll,
    }


@router.get(
    "/attendance-trends",
    response_model=List[AttendanceTrendItem],
    status_code=status.HTTP_200_OK,
    summary="Get attendance trends over past N days",
)
def get_attendance_trends(
    days: int = Query(7, ge=1, le=90),
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Provides daily attendance distribution data for trend charting.
    """
    today = date.today()
    start_date = today - timedelta(days=days - 1)
    
    results: List[AttendanceTrendItem] = []
    current_date = start_date
    while current_date <= today:
        present_count = db.query(Attendance).filter(
            Attendance.date == current_date,
            Attendance.status == AttendanceStatus.PRESENT,
        ).count()
        
        half_day_count = db.query(Attendance).filter(
            Attendance.date == current_date,
            Attendance.status == AttendanceStatus.HALF_DAY,
        ).count()
        
        absent_count = db.query(Attendance).filter(
            Attendance.date == current_date,
            Attendance.status == AttendanceStatus.ABSENT,
        ).count()

        results.append(
            AttendanceTrendItem(
                date=current_date,
                present_count=present_count,
                absent_count=absent_count,
                half_day_count=half_day_count,
            )
        )
        current_date += timedelta(days=1)

    return results


@router.get(
    "/leave-breakdown",
    response_model=List[LeaveBreakdownItem],
    status_code=status.HTTP_200_OK,
    summary="Get leave applications breakdown by type",
)
def get_leave_breakdown(
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Provides leave requests breakdown grouped by type.
    """
    counts = (
        db.query(LeaveRequest.leave_type, func.count(LeaveRequest.id))
        .group_by(LeaveRequest.leave_type)
        .all()
    )
    return [
        LeaveBreakdownItem(leave_type=ltype.value if hasattr(ltype, "value") else str(ltype), count=cnt)
        for ltype, cnt in counts
    ]


@router.get(
    "/department-headcount",
    response_model=List[DepartmentHeadcountItem],
    status_code=status.HTTP_200_OK,
    summary="Get employee headcount by department",
)
def get_department_headcount(
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Provides employee count per department for org charts and reports.
    """
    counts = (
        db.query(EmployeeProfile.department, func.count(EmployeeProfile.id))
        .group_by(EmployeeProfile.department)
        .all()
    )
    return [
        DepartmentHeadcountItem(department=dept, count=cnt)
        for dept, cnt in counts
    ]
