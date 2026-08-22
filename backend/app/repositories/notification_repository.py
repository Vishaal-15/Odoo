from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, db: Session):
        super().__init__(Notification, db)

    def list_by_user(
        self,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50,
    ) -> Tuple[List[Notification], int]:
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        unread_count = (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .count()
        )
        items = query.order_by(Notification.created_at.desc()).limit(limit).all()
        return items, unread_count

    def mark_as_read(self, notification_id: int, user_id: int) -> Optional[Notification]:
        notif = (
            self.db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )
        if notif:
            notif.is_read = True
            self.db.commit()
            self.db.refresh(notif)
        return notif

    def mark_all_as_read(self, user_id: int) -> int:
        updated = (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .update({"is_read": True})
        )
        self.db.commit()
        return updated

    def create_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        notif_type: NotificationType = NotificationType.GENERAL,
        link: Optional[str] = None,
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type,
            link=link,
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif
