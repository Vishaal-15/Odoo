from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[int] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    total: int
    items: List[AuditLogResponse]
