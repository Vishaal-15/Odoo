from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import require_admin
from app.models.user import User
from app.schemas.audit_log import AuditLogListResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs & Compliance (SOC 2)"])


@router.get(
    "",
    response_model=AuditLogListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get immutable audit logs (Admin only)",
)
def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    actor_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Retrieve SOC 2 compliant immutable audit trail logs.
    Restricted to system Administrators.
    """
    service = AuditService(db)
    items, total = service.list_logs(
        skip=skip,
        limit=limit,
        actor_id=actor_id,
        action=action,
        resource_type=resource_type,
    )
    return {"total": total, "items": items}
