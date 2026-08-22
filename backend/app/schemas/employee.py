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
    company_name: Optional[str] = "Odoo India"
    department: str = "General"
    designation: str = "Employee"
    manager_name: Optional[str] = None
    location: Optional[str] = "Headquarters"
    joining_date: date
    emergency_contact: Optional[str] = None
    basic_salary: float = 50000.0

    # Resume Tab Fields
    about: Optional[str] = None
    what_i_love: Optional[str] = None
    interests_and_hobbies: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None

    # Private Info Tab Fields
    date_of_birth: Optional[date] = None
    nationality: Optional[str] = "Indian"
    personal_email: Optional[str] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    pan_no: Optional[str] = None
    uan_no: Optional[str] = None


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
    about: Optional[str] = None
    what_i_love: Optional[str] = None
    interests_and_hobbies: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None
    date_of_birth: Optional[date] = None
    nationality: Optional[str] = None
    personal_email: Optional[str] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    pan_no: Optional[str] = None
    uan_no: Optional[str] = None


class EmployeeUpdateAdmin(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture_url: Optional[str] = None
    company_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    manager_name: Optional[str] = None
    location: Optional[str] = None
    joining_date: Optional[date] = None
    emergency_contact: Optional[str] = None
    basic_salary: Optional[float] = None
    about: Optional[str] = None
    what_i_love: Optional[str] = None
    interests_and_hobbies: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None
    date_of_birth: Optional[date] = None
    nationality: Optional[str] = None
    personal_email: Optional[str] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    pan_no: Optional[str] = None
    uan_no: Optional[str] = None


class EmployeeListResponse(BaseModel):
    total: int
    items: List[EmployeeResponse]

