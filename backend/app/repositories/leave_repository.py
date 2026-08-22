from datetime import date
from typing import Optional, List, Tuple
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from app.models.leave import LeaveRequest, LeaveStatus
from app.repositories.base import BaseRepository


class LeaveRepository(BaseRepository[LeaveRequest]):
    def __init__(self, db: Session):
        super().__init__(LeaveRequest, db)

    def get_by_id(self, leave_id: int) -> Optional[LeaveRequest]:
        return self.db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()

    def list_by_user(
        self,
        user_id: int,
        status: Optional[LeaveStatus] = None,
    ) -> List[LeaveRequest]:
        query = self.db.query(LeaveRequest).filter(LeaveRequest.user_id == user_id)
        if status:
            query = query.filter(LeaveRequest.status == status)
        return query.order_by(LeaveRequest.created_at.desc()).all()

    def list_all(
        self,
        skip: int = 0,
        limit: int = 50,
        user_id: Optional[int] = None,
        status: Optional[LeaveStatus] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Tuple[List[LeaveRequest], int]:
        query = self.db.query(LeaveRequest)
        if user_id:
            query = query.filter(LeaveRequest.user_id == user_id)
        if status:
            query = query.filter(LeaveRequest.status == status)
        if start_date:
            query = query.filter(LeaveRequest.start_date >= start_date)
        if end_date:
            query = query.filter(LeaveRequest.end_date <= end_date)

        total = query.count()
        items = query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def count_by_status(self, status: LeaveStatus) -> int:
        return self.db.query(LeaveRequest).filter(LeaveRequest.status == status).count()

    def count_on_leave_today(self, target_date: date) -> int:
        return (
            self.db.query(LeaveRequest)
            .filter(
                LeaveRequest.status == LeaveStatus.APPROVED,
                LeaveRequest.start_date <= target_date,
                LeaveRequest.end_date >= target_date,
            )
            .count()
        )

    def find_overlapping(
        self,
        user_id: int,
        start_date: date,
        end_date: date,
        exclude_id: Optional[int] = None,
    ) -> List[LeaveRequest]:
        query = self.db.query(LeaveRequest).filter(
            LeaveRequest.user_id == user_id,
            LeaveRequest.status != LeaveStatus.REJECTED,
            or_(
                and_(LeaveRequest.start_date <= start_date, LeaveRequest.end_date >= start_date),
                and_(LeaveRequest.start_date <= end_date, LeaveRequest.end_date >= end_date),
                and_(LeaveRequest.start_date >= start_date, LeaveRequest.end_date <= end_date),
            ),
        )
        if exclude_id:
            query = query.filter(LeaveRequest.id != exclude_id)
        return query.all()
