from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import RoleEnum


class UserBase(BaseModel):
    employee_id: Optional[str] = Field(default=None, max_length=50, examples=["OIJODO20250001"])
    email: EmailStr = Field(..., examples=["employee@company.com"])


class UserRegister(UserBase):
    password: str = Field(..., min_length=8, max_length=128, examples=["SecurePass123!"])
    first_name: str = Field(..., min_length=1, max_length=100, examples=["Alex"])
    last_name: str = Field(..., min_length=1, max_length=100, examples=["Morgan"])
    company_name: Optional[str] = Field(default="Odoo India", examples=["Odoo India"])
    role: Optional[RoleEnum] = Field(default=RoleEnum.EMPLOYEE, examples=["EMPLOYEE"])
    department: Optional[str] = Field(default="Engineering", examples=["Engineering"])
    designation: Optional[str] = Field(default="Software Engineer", examples=["Software Engineer"])
    phone: Optional[str] = Field(default=None, examples=["+1234567890"])
    joining_date: Optional[date] = Field(default=None)


class UserLogin(BaseModel):
    email: str = Field(..., examples=["admin@dayflow.com", "OIJODO20250001"])
    password: str = Field(..., examples=["SecurePass123!"])



class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: dict


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., examples=["dGhpcy1pcy1hLXJlZnJlc2gtdG9rZW4..."])


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., examples=["email-verification-token-string"])


class ResendVerificationRequest(BaseModel):
    email: EmailStr = Field(..., examples=["employee@company.com"])


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = Field(default=None, examples=["refresh-token-to-revoke"])


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None
