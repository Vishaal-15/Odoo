from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field, model_validator
from app.models.leave import LeaveType, LeaveStatus


class LeaveCreateRequest(BaseModel):
    leave_type: LeaveType = Field(default=LeaveType.PAID, examples=["PAID"])
    start_date: date = Field(..., examples=["2026-08-25"])
    end_date: date = Field(..., examples=["2026-08-27"])
    reason: str = Field(..., min_length=3, max_length=1000, examples=["Vacation leave with family"])

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date cannot be before start_date")
        return self


class LeaveStatusUpdateRequest(BaseModel):
    status: LeaveStatus = Field(..., examples=["APPROVED"])
    reviewer_comments: Optional[str] = Field(default=None, examples=["Approved by HR."])

    @model_validator(mode="after")
    def validate_status_transition(self):
        if self.status not in (LeaveStatus.APPROVED, LeaveStatus.REJECTED):
            raise ValueError("Status must be updated to either APPROVED or REJECTED")
        return self


class LeaveResponse(BaseModel):
    id: int
    user_id: int
    leave_type: LeaveType
    start_date: date
    end_date: date
    days_count: int
    reason: str
    status: LeaveStatus
    reviewer_id: Optional[int] = None
    reviewer_comments: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeaveListResponse(BaseModel):
    total: int
    items: List[LeaveResponse]
