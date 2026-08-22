from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, require_hr, require_admin
from app.models.user import User, RoleEnum
from app.schemas.employee import (
    EmployeeResponse,
    EmployeeListResponse,
    EmployeeProfileUpdateSelf,
    EmployeeUpdateAdmin,
)
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["Employee Management"])


@router.get(
    "/me",
    response_model=EmployeeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get logged-in employee profile",
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve own complete employee profile.
    """
    return current_user


@router.patch(
    "/me",
    response_model=EmployeeResponse,
    status_code=status.HTTP_200_OK,
    summary="Update logged-in employee profile (limited fields)",
)
def update_my_profile(
    data: EmployeeProfileUpdateSelf,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Employees can update limited personal fields (phone, address, profile picture, emergency contact).
    """
    service = EmployeeService(db)
    return service.update_self_profile(current_user.id, data)


@router.get(
    "",
    response_model=EmployeeListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all employees (HR/Admin only)",
)
def list_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    department: Optional[str] = Query(None),
    role: Optional[RoleEnum] = Query(None),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    HR and Admin can query and filter organization employees.
    """
    service = EmployeeService(db)
    items, total = service.list_employees(
        skip=skip,
        limit=limit,
        department=department,
        role=role,
        search=search,
        is_active=is_active,
    )
    return {"total": total, "items": items}


@router.get(
    "/{id}",
    response_model=EmployeeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get employee details by ID",
)
def get_employee_by_id(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get employee details. Regular employees can only view their own profile.
    """
    service = EmployeeService(db)
    return service.get_employee(id, current_user)


@router.patch(
    "/{id}",
    response_model=EmployeeResponse,
    status_code=status.HTTP_200_OK,
    summary="Update employee details (HR/Admin only)",
)
def update_employee_by_id(
    id: int,
    data: EmployeeUpdateAdmin,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    """
    HR and Admin can update complete employee information including department, salary, role, and active status.
    Generates SOC 2 compliance audit logs for salary and role changes.
    """
    service = EmployeeService(db)
    return service.update_employee_by_admin(id, data, actor=current_user)


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Soft delete an employee (Admin only)",
)
def delete_employee_by_id(
    id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Soft deletes an employee record, setting is_deleted=True and deactivating access.
    """
    service = EmployeeService(db)
    service.soft_delete_employee(id, actor=current_user)
    return {"message": f"Employee #{id} successfully soft-deleted."}
