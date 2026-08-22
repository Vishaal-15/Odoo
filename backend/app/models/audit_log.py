from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g. "USER_LOGIN", "UPDATE_SALARY", "ROLE_CHANGE"
    resource_type = Column(String(100), nullable=False, index=True)  # e.g. "USER", "EMPLOYEE_PROFILE", "PAYROLL"
    resource_id = Column(String(100), nullable=True, index=True)
    details = Column(Text, nullable=True)  # JSON formatted snapshot or summary
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    actor = relationship("User", foreign_keys=[actor_id])
