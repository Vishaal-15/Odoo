from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.attendance import AttendanceStatus


class CheckInRequest(BaseModel):
    remarks: Optional[str] = Field(default=None, examples=["Working from office"])


class CheckOutRequest(BaseModel):
    remarks: Optional[str] = Field(default=None, examples=["Day ended"])


class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    date: date
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    total_hours: float = 0.0
    status: AttendanceStatus
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AttendanceListResponse(BaseModel):
    total: int
    items: List[AttendanceResponse]


class AttendanceSummaryResponse(BaseModel):
    date: date
    total_employees: int
    present_today: int
    absent_today: int
    on_leave_today: int
    checked_in_active: int
