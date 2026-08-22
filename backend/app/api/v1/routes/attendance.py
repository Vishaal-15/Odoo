from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, require_hr
from app.models.user import User
from app.models.attendance import AttendanceStatus
from app.schemas.attendance import (
    CheckInRequest,
    CheckOutRequest,
    AttendanceResponse,
    AttendanceListResponse,
    AttendanceSummaryResponse,
)
from app.services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["Attendance Management"])


@router.post(
    "/check-in",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record employee check-in",
)
def check_in(
    data: CheckInRequest = CheckInRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Clock in for today. Prevents duplicate check-ins for the same day.
    """
    service = AttendanceService(db)
    return service.check_in(current_user.id, data)


@router.post(
    "/check-out",
    response_model=AttendanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Record employee check-out",
)
def check_out(
    data: CheckOutRequest = CheckOutRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Clock out for today. Validates active check-in and calculates worked hours.
    """
    service = AttendanceService(db)
    return service.check_out(current_user.id, data)


@router.get(
    "/me",
    response_model=list[AttendanceResponse],
    status_code=status.HTTP_200_OK,
    summary="Get own attendance history",
)
def get_my_attendance(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve personal attendance history with date range filtering.
    """
    service = AttendanceService(db)
    return service.get_user_history(current_user.id, start_date=start_date, end_date=end_date)


@router.get(
    "/me/today",
    response_model=Optional[AttendanceResponse],
    status_code=status.HTTP_200_OK,
    summary="Get today's check-in/out status",
)
def get_my_today_attendance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get today's active attendance punch status for logged-in user.
    """
    service = AttendanceService(db)
    return service.get_user_today(current_user.id)


@router.get(
    "/summary",
    response_model=AttendanceSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get attendance summary statistics (HR/Admin only)",
)
def get_attendance_summary(
    target_date: Optional[date] = Query(None, alias="date"),
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Get organization-wide attendance overview (present, absent, on leave, active check-ins).
    """
    service = AttendanceService(db)
    return service.get_summary(target_date)


@router.get(
    "",
    response_model=AttendanceListResponse,
    status_code=status.HTTP_200_OK,
    summary="List attendance records of all employees (HR/Admin only)",
)
def list_all_attendance(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[int] = Query(None),
    target_date: Optional[date] = Query(None, alias="date"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status_filter: Optional[AttendanceStatus] = Query(None, alias="status"),
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Query attendance records across all employees with flexible filters.
    """
    service = AttendanceService(db)
    items, total = service.list_all_attendance(
        skip=skip,
        limit=limit,
        user_id=user_id,
        target_date=target_date,
        start_date=start_date,
        end_date=end_date,
        status_filter=status_filter,
    )
    return {"total": total, "items": items}
