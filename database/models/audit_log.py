from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base


class AuditLog(Base):
    """
    Audit Log entity recording security, administrative, and data change events.
    Supports system auditing, compliance, and Developer 4 analytics.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    action = Column(String(100), nullable=False, index=True)  # e.g., "USER_SIGNUP", "APPROVE_LEAVE", "UPDATE_SALARY"
    entity_name = Column(String(100), nullable=False, index=True)  # e.g., "leave_requests", "employees", "payrolls"
    entity_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)  # payload diff or event metadata
    ip_address = Column(String(45), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    user = relationship(
        "User",
        back_populates="audit_logs"
    )

    __table_args__ = (
        Index("ix_audit_logs_action_created", "action", "created_at"),
        Index("ix_audit_logs_entity", "entity_name", "entity_id"),
    )

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id} action='{self.action}' entity='{self.entity_name}:{self.entity_id}'>"
