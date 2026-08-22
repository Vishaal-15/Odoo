from sqlalchemy import Column, Integer, Date, DateTime, Numeric, Text, ForeignKey, Enum as SQLEnum, UniqueConstraint, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base
from database.models.enums import AttendanceStatus


class Attendance(Base):
    """
    Attendance entity tracking daily clock-in, clock-out, total hours and status.
    Matches Dayflow HRMS Section 3.4 (Attendance Management).
    """
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    check_in = Column(DateTime(timezone=True), nullable=True)
    check_out = Column(DateTime(timezone=True), nullable=True)
    work_hours = Column(Numeric(5, 2), nullable=True, default=0.00)
    status = Column(
        SQLEnum(AttendanceStatus, name="attendance_status_enum", create_type=False),
        default=AttendanceStatus.PRESENT,
        nullable=False,
        index=True
    )
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    employee = relationship(
        "Employee",
        back_populates="attendance_records"
    )

    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_attendance_employee_date"),
        Index("ix_attendance_employee_date", "employee_id", "date"),
    )

    def __repr__(self) -> str:
        return f"<Attendance id={self.id} employee_id={self.employee_id} date={self.date} status='{self.status}'>"
