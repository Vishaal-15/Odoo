from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, require_hr
from app.models.user import User
from app.models.leave import LeaveStatus
from app.schemas.leave import (
    LeaveCreateRequest,
    LeaveStatusUpdateRequest,
    LeaveResponse,
    LeaveListResponse,
)
from app.services.leave_service import LeaveService

router = APIRouter(prefix="/leaves", tags=["Leave & Time-Off Management"])


@router.post(
    "",
    response_model=LeaveResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Apply for leave",
)
def apply_leave(
    data: LeaveCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit a new leave application. Automatically notifies HR/Admin officers.
    """
    service = LeaveService(db)
    return service.apply_leave(current_user.id, data)


@router.get(
    "/me",
    response_model=List[LeaveResponse],
    status_code=status.HTTP_200_OK,
    summary="Get own leave requests",
)
def get_my_leaves(
    status: Optional[LeaveStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all leave requests submitted by the logged-in employee.
    """
    service = LeaveService(db)
    return service.list_my_leaves(current_user.id, status=status)


@router.get(
    "",
    response_model=LeaveListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all leave requests (HR/Admin only)",
)
def list_all_leaves(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[int] = Query(None),
    status: Optional[LeaveStatus] = Query(None),
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    HR and Admin can view and filter all leave requests in the organization.
    """
    service = LeaveService(db)
    items, total = service.list_all_leaves(
        skip=skip,
        limit=limit,
        user_id=user_id,
        status=status,
    )
    return {"total": total, "items": items}


@router.get(
    "/{id}",
    response_model=LeaveResponse,
    status_code=status.HTTP_200_OK,
    summary="Get leave request details by ID",
)
def get_leave_details(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get detailed information about a leave request.
    """
    service = LeaveService(db)
    return service.get_leave_by_id(id, current_user)


@router.patch(
    "/{id}/status",
    response_model=LeaveResponse,
    status_code=status.HTTP_200_OK,
    summary="Approve or Reject leave request (HR/Admin only)",
)
def review_leave_request(
    id: int,
    data: LeaveStatusUpdateRequest,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    Approve or reject an employee's pending leave request with optional comments.
    """
    service = LeaveService(db)
    return service.update_status(id, current_user, data)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel a pending leave request",
)
def cancel_leave(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cancel own pending leave application.
    """
    service = LeaveService(db)
    service.cancel_leave(id, current_user)
