from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
)
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=NotificationListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user notifications",
)
def get_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve in-app notifications for the logged-in user.
    """
    service = NotificationService(db)
    items, unread_count = service.get_user_notifications(
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit,
    )
    return {"unread_count": unread_count, "items": items}


@router.patch(
    "/{id}/read",
    response_model=NotificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark notification as read",
)
def mark_notification_read(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark a specific notification as read.
    """
    service = NotificationService(db)
    return service.mark_read(id, current_user.id)


@router.patch(
    "/read-all",
    status_code=status.HTTP_200_OK,
    summary="Mark all notifications as read",
)
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark all unread notifications for current user as read.
    """
    service = NotificationService(db)
    count = service.mark_all_read(current_user.id)
    return {"message": f"Marked {count} notifications as read."}
