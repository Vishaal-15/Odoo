from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.repositories.base import BaseRepository


class AuditRepository(BaseRepository[AuditLog]):
    def __init__(self, db: Session):
        super().__init__(AuditLog, db)

    def create_log(
        self,
        action: str,
        resource_type: str,
        actor_id: Optional[int] = None,
        resource_id: Optional[str] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        log = AuditLog(
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def list_logs(
        self,
        skip: int = 0,
        limit: int = 50,
        actor_id: Optional[int] = None,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
    ) -> Tuple[List[AuditLog], int]:
        query = self.db.query(AuditLog)
        if actor_id:
            query = query.filter(AuditLog.actor_id == actor_id)
        if action:
            query = query.filter(AuditLog.action == action)
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)

        total = query.count()
        items = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
        return items, total
