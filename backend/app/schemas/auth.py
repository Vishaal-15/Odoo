from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import RoleEnum


class UserBase(BaseModel):
    employee_id: str = Field(..., min_length=2, max_length=50, examples=["EMP1001"])
    email: EmailStr = Field(..., examples=["employee@company.com"])


class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=128, examples=["SecurePass123!"])
    first_name: str = Field(..., min_length=1, max_length=100, examples=["Alex"])
    last_name: str = Field(..., min_length=1, max_length=100, examples=["Morgan"])
    role: Optional[RoleEnum] = Field(default=RoleEnum.EMPLOYEE, examples=["EMPLOYEE"])
    department: Optional[str] = Field(default="Engineering", examples=["Engineering"])
    designation: Optional[str] = Field(default="Software Engineer", examples=["Software Engineer"])
    phone: Optional[str] = Field(default=None, examples=["+1234567890"])
    joining_date: Optional[date] = Field(default=None)


class UserLogin(BaseModel):
    email: EmailStr = Field(..., examples=["employee@company.com"])
    password: str = Field(..., examples=["SecurePass123!"])


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
