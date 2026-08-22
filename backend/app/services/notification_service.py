from typing import List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.notif_repo = NotificationRepository(db)

    def get_user_notifications(
        self,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50,
    ) -> Tuple[List[Notification], int]:
        return self.notif_repo.list_by_user(user_id, unread_only=unread_only, limit=limit)

    def mark_read(self, notification_id: int, user_id: int) -> Notification:
        notif = self.notif_repo.mark_as_read(notification_id, user_id)
        if not notif:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification #{notification_id} not found.",
            )
        return notif

    def mark_all_read(self, user_id: int) -> int:
        return self.notif_repo.mark_all_as_read(user_id)
