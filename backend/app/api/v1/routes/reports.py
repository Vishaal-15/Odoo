from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import require_hr
from app.models.user import User
from app.services.report_service import ReportService
from app.schemas.reports import (
    ReportSummaryItem,
    AttendanceReportRow,
    LeaveReportRow,
    EmployeeReportRow,
    PayrollReportRow,
    ReportExportRequest,
    ReportExportResponse,
)

router = APIRouter(prefix="/reports", tags=["Corporate Reports & Data Exports"])


@router.get(
    "/summary",
    response_model=List[ReportSummaryItem],
    status_code=status.HTTP_200_OK,
    summary="Get available corporate report templates and export logs",
)
def get_reports_summary(
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Returns list of standard corporate reports with archive metadata.
    """
    service = ReportService(db)
    return service.get_reports_summary()


@router.get(
    "/attendance",
    response_model=List[AttendanceReportRow],
    status_code=status.HTTP_200_OK,
    summary="Generate attendance register report with filters",
)
def get_attendance_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    department: Optional[str] = Query(None),
    employee_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Generates detailed employee attendance shift records filtered by date range and department.
    """
    service = ReportService(db)
    return service.get_attendance_report(
        start_date=start_date,
        end_date=end_date,
        department=department,
        employee_id=employee_id,
        status_filter=status,
    )


@router.get(
    "/leave",
    response_model=List[LeaveReportRow],
    status_code=status.HTTP_200_OK,
    summary="Generate time-off and leave audit report with filters",
)
def get_leave_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    department: Optional[str] = Query(None),
    leave_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Generates company-wide leave application log with duration and approval status.
    """
    service = ReportService(db)
    return service.get_leave_report(
        start_date=start_date,
        end_date=end_date,
        department=department,
        leave_type=leave_type,
        status_filter=status,
    )


@router.get(
    "/employees",
    response_model=List[EmployeeReportRow],
    status_code=status.HTTP_200_OK,
    summary="Generate workforce directory and headcount roster report",
)
def get_employee_report(
    department: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Generates complete employee roster with designation, joining date, and salary.
    """
    service = ReportService(db)
    return service.get_employee_report(
        department=department,
        role=role,
        status_filter=status,
    )


@router.get(
    "/payroll",
    response_model=List[PayrollReportRow],
    status_code=status.HTTP_200_OK,
    summary="Generate payroll statement and compensation report",
)
def get_payroll_report(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Generates payroll statement detailing base compensation, allowances, deductions, and payment status.
    """
    service = ReportService(db)
    return service.get_payroll_report(
        month=month,
        year=year,
        department=department,
        payment_status=status,
    )


@router.post(
    "/export",
    response_model=ReportExportResponse,
    status_code=status.HTTP_200_OK,
    summary="Export report data as CSV or structured format",
)
def export_report(
    payload: ReportExportRequest,
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Generates export file data for attendance, leave, employees, or payroll.
    """
    service = ReportService(db)
    return service.export_report(payload)
