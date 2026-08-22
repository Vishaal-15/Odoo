from datetime import date
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import require_hr
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    OverviewStatsResponse,
    AttendanceTrendItem,
    LeaveBreakdownItem,
    DepartmentHeadcountItem,
    AttendanceAnalyticsResponse,
    LeaveAnalyticsResponse,
    EmployeeAnalyticsResponse,
    PayrollAnalyticsResponse,
)

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
    Returns aggregated KPIs and telemetry for the executive/HR dashboard.
    """
    service = AnalyticsService(db)
    return service.get_overview_stats()


@router.get(
    "/attendance",
    response_model=AttendanceAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get comprehensive attendance statistics and trends",
)
def get_attendance_analytics(
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Provides attendance rates, present/absent counts, and 14-day daily distribution.
    """
    service = AnalyticsService(db)
    return service.get_attendance_analytics()


@router.get(
    "/leave",
    response_model=LeaveAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get leave request statistics and category breakdowns",
)
def get_leave_analytics(
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Provides approved/pending/rejected leave counts and category quotas.
    """
    service = AnalyticsService(db)
    return service.get_leave_analytics()


@router.get(
    "/employees",
    response_model=EmployeeAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get employee headcount, retention, and department distributions",
)
def get_employee_analytics(
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Provides workforce distribution across departments, active/inactive counts, and roles.
    """
    service = AnalyticsService(db)
    return service.get_employee_analytics()


@router.get(
    "/payroll",
    response_model=PayrollAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get payroll aggregates, average compensation, and department outlays",
)
def get_payroll_analytics(
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Provides total salary outlay, average compensation, and upcoming disbursement status.
    """
    service = AnalyticsService(db)
    return service.get_payroll_analytics()


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
    service = AnalyticsService(db)
    return service.get_attendance_trends(days=days)


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
    service = AnalyticsService(db)
    res = service.get_leave_analytics()
    return [LeaveBreakdownItem(leave_type=item.type, count=item.count) for item in res.breakdown_by_type]


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
    service = AnalyticsService(db)
    res = service.get_employee_analytics()
    return res.department_headcounts


@router.get(
    "/department-breakdown",
    response_model=List[DepartmentHeadcountItem],
    status_code=status.HTTP_200_OK,
    summary="Get employee department breakdown (frontend compatibility)",
)
def get_department_breakdown(
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Provides department breakdown for frontend widget compatibility.
    """
    service = AnalyticsService(db)
    res = service.get_employee_analytics()
    return res.department_headcounts
