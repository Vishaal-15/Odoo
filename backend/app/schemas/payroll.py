from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.payroll import PaymentStatus


class PayrollCreateRequest(BaseModel):
    user_id: int = Field(..., examples=[1])
    month: int = Field(..., ge=1, le=12, examples=[8])
    year: int = Field(..., ge=2000, le=2100, examples=[2026])
    basic_salary: float = Field(..., ge=0.0, examples=[8000.0])
    allowances: Optional[float] = Field(default=0.0, ge=0.0, examples=[1000.0])
    deductions: Optional[float] = Field(default=0.0, ge=0.0, examples=[200.0])
    payment_status: Optional[PaymentStatus] = Field(default=PaymentStatus.PENDING, examples=["PENDING"])
    payment_date: Optional[date] = Field(default=None, examples=["2026-08-31"])
    remarks: Optional[str] = Field(default=None, examples=["Monthly Salary"])


class PayrollUpdateRequest(BaseModel):
    basic_salary: Optional[float] = Field(default=None, ge=0.0)
    allowances: Optional[float] = Field(default=None, ge=0.0)
    deductions: Optional[float] = Field(default=None, ge=0.0)
    payment_status: Optional[PaymentStatus] = None
    payment_date: Optional[date] = None
    remarks: Optional[str] = None


class PayrollResponse(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    basic_salary: float
    allowances: float
    deductions: float
    net_salary: float
    payment_status: PaymentStatus
    payment_date: Optional[date] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PayrollListResponse(BaseModel):
    total: int
    items: List[PayrollResponse]
