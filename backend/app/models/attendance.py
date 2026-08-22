import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    Float,
    DateTime,
    Date,
    Text,
    ForeignKey,
    Enum as SQLEnum,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    ON_LEAVE = "ON_LEAVE"


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    check_in_time = Column(DateTime(timezone=True), nullable=True)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    total_hours = Column(Float, default=0.0, nullable=False)
    status = Column(SQLEnum(AttendanceStatus), default=AttendanceStatus.PRESENT, nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_user_attendance_date"),
    )

    @property
    def extra_hours(self) -> float:
        """Overtime hours worked beyond standard 8.0 hour working shift."""
        return round(max(0.0, float(self.total_hours or 0.0) - 8.0), 2)

    user = relationship("User", back_populates="attendances")

