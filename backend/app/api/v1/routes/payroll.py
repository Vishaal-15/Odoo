from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, require_hr
from app.models.user import User
from app.models.payroll import PaymentStatus
from app.schemas.payroll import (
    PayrollCreateRequest,
    PayrollUpdateRequest,
    PayrollResponse,
    PayrollListResponse,
    PayrollGenerateBatchRequest,
)

from app.services.payroll_service import PayrollService

router = APIRouter(prefix="/payroll", tags=["Payroll Management"])


@router.get(
    "/me",
    response_model=List[PayrollResponse],
    status_code=status.HTTP_200_OK,
    summary="Get own payroll history",
)
def get_my_payroll(
    year: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Employees can view their personal salary slips and payment history.
    """
    service = PayrollService(db)
    return service.list_my_payroll(current_user.id, year=year)


@router.get(
    "",
    response_model=PayrollListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all payroll records (HR/Admin only)",
)
def list_all_payroll(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[int] = Query(None),
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None),
    payment_status: Optional[PaymentStatus] = Query(None),
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    HR and Admin can query, filter, and inspect payroll records across the company.
    """
    service = PayrollService(db)
    items, total = service.list_all_payroll(
        skip=skip,
        limit=limit,
        user_id=user_id,
        month=month,
        year=year,
        status_filter=payment_status,
    )
    return {"total": total, "items": items}


@router.post(
    "/generate",
    status_code=status.HTTP_200_OK,
    summary="Batch execute attendance-driven payroll cycle (HR/Admin only)",
)
def generate_payroll_batch(
    payload: Optional[PayrollGenerateBatchRequest] = None,
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    HR and Admin can trigger automated attendance-based payslip generation for the workforce.
    """
    service = PayrollService(db)
    month = payload.month if payload else None
    year = payload.year if payload else None
    working_days = payload.working_days if payload and payload.working_days else 22
    pay_period = payload.pay_period if payload else None
    return service.generate_monthly_payroll_batch(
        month=month,
        year=year,
        working_days=working_days,
        pay_period=pay_period,
    )


@router.post(
    "",
    response_model=PayrollResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate payroll record (HR/Admin only)",
)
def create_payroll(
    data: PayrollCreateRequest,
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    HR and Admin can generate a new payroll record for an employee.
    """
    service = PayrollService(db)
    return service.create_payroll(data)



@router.get(
    "/{id}",
    response_model=PayrollResponse,
    status_code=status.HTTP_200_OK,
    summary="Get payroll record by ID",
)
def get_payroll_by_id(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    View payroll slip details. Regular employees can only view their own slips.
    """
    service = PayrollService(db)
    return service.get_payroll_by_id(id, current_user)


@router.patch(
    "/{id}",
    response_model=PayrollResponse,
    status_code=status.HTTP_200_OK,
    summary="Update payroll record (HR/Admin only)",
)
def update_payroll(
    id: int,
    data: PayrollUpdateRequest,
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    HR and Admin can modify salary components or payment status.
    """
    service = PayrollService(db)
    return service.update_payroll(id, data)
