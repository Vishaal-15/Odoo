import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class NotificationType(str, enum.Enum):
    LEAVE = "LEAVE"
    ATTENDANCE = "ATTENDANCE"
    PAYROLL = "PAYROLL"
    GENERAL = "GENERAL"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(SQLEnum(NotificationType), default=NotificationType.GENERAL, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="notifications")
