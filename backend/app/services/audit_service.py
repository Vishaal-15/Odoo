import json
from typing import Optional, List, Tuple, Any, Dict, Union
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.repositories.audit_repository import AuditRepository


class AuditService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_repo = AuditRepository(db)

    def log_event(
        self,
        action: str,
        resource_type: str,
        actor_id: Optional[int] = None,
        resource_id: Optional[Any] = None,
        details: Optional[Union[str, Dict[str, Any]]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        details_str = details
        if isinstance(details, dict):
            details_str = json.dumps(details)

        return self.audit_repo.create_log(
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            details=details_str,
            ip_address=ip_address,
            user_agent=user_agent,
        )

    def list_logs(
        self,
        skip: int = 0,
        limit: int = 50,
        actor_id: Optional[int] = None,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
    ) -> Tuple[List[AuditLog], int]:
        return self.audit_repo.list_logs(
            skip=skip,
            limit=limit,
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
        )
