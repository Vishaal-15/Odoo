from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, Boolean, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base
from database.models.enums import LeaveStatus


class LeaveType(Base):
    """
    Leave policy definitions (e.g. Paid Leave, Sick Leave, Unpaid Leave).
    """
    __tablename__ = "leave_types"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    days_allowed_per_year = Column(Integer, default=12, nullable=False)
    is_paid = Column(Boolean, default=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    leave_requests = relationship(
        "LeaveRequest",
        back_populates="leave_type",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<LeaveType id={self.id} code='{self.code}' name='{self.name}'>"


class LeaveRequest(Base):
    """
    Leave application entity tracking employee time-off and approval workflow.
    Matches Dayflow HRMS Section 3.5 (Leave & Time-Off Management).
    """
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_type_id = Column(Integer, ForeignKey("leave_types.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days_count = Column(Numeric(4, 1), nullable=False)
    reason = Column(Text, nullable=False)
    
    status = Column(
        SQLEnum(LeaveStatus, name="leave_status_enum", create_type=False),
        default=LeaveStatus.PENDING,
        nullable=False,
        index=True
    )
    
    # Approval Workflow (Admin / HR)
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_comments = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    employee = relationship(
        "Employee",
        back_populates="leave_requests"
    )
    leave_type = relationship(
        "LeaveType",
        back_populates="leave_requests"
    )
    reviewer = relationship(
        "User",
        foreign_keys=[reviewed_by]
    )

    __table_args__ = (
        Index("ix_leave_requests_employee_status", "employee_id", "status"),
        Index("ix_leave_requests_dates", "start_date", "end_date"),
    )

    def __repr__(self) -> str:
        return f"<LeaveRequest id={self.id} employee_id={self.employee_id} status='{self.status}' days={self.days_count}>"
