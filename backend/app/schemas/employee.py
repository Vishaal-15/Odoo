from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.models.user import RoleEnum


class EmployeeProfileBase(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture_url: Optional[str] = None
    department: str = "General"
    designation: str = "Employee"
    joining_date: date
    emergency_contact: Optional[str] = None
    basic_salary: float = 0.0


class EmployeeProfileResponse(EmployeeProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    email: EmailStr
    role: RoleEnum
    is_active: bool
    created_at: datetime
    updated_at: datetime
    profile: Optional[EmployeeProfileResponse] = None

    class Config:
        from_attributes = True


class EmployeeProfileUpdateSelf(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture_url: Optional[str] = None
    emergency_contact: Optional[str] = None


class EmployeeUpdateAdmin(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture_url: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    emergency_contact: Optional[str] = None
    basic_salary: Optional[float] = None


class EmployeeListResponse(BaseModel):
    total: int
    items: List[EmployeeResponse]
