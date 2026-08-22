from datetime import date
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.attendance import Attendance, AttendanceStatus
from app.repositories.base import BaseRepository


class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self, db: Session):
        super().__init__(Attendance, db)

    def get_by_user_and_date(self, user_id: int, target_date: date) -> Optional[Attendance]:
        return (
            self.db.query(Attendance)
            .filter(Attendance.user_id == user_id, Attendance.date == target_date)
            .first()
        )

    def list_by_user(
        self,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[Attendance]:
        query = self.db.query(Attendance).filter(Attendance.user_id == user_id)
        if start_date:
            query = query.filter(Attendance.date >= start_date)
        if end_date:
            query = query.filter(Attendance.date <= end_date)
        return query.order_by(Attendance.date.desc()).all()

    def list_all(
        self,
        skip: int = 0,
        limit: int = 50,
        user_id: Optional[int] = None,
        target_date: Optional[date] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        status: Optional[AttendanceStatus] = None,
    ) -> Tuple[List[Attendance], int]:
        query = self.db.query(Attendance)
        if user_id:
            query = query.filter(Attendance.user_id == user_id)
        if target_date:
            query = query.filter(Attendance.date == target_date)
        if start_date:
            query = query.filter(Attendance.date >= start_date)
        if end_date:
            query = query.filter(Attendance.date <= end_date)
        if status:
            query = query.filter(Attendance.status == status)

        total = query.count()
        items = query.order_by(Attendance.date.desc(), Attendance.id.desc()).offset(skip).limit(limit).all()
        return items, total

    def count_by_status_and_date(self, target_date: date, status: AttendanceStatus) -> int:
        return (
            self.db.query(Attendance)
            .filter(Attendance.date == target_date, Attendance.status == status)
            .count()
        )

    def count_active_checkins(self, target_date: date) -> int:
        return (
            self.db.query(Attendance)
            .filter(
                Attendance.date == target_date,
                Attendance.check_in_time.isnot(None),
                Attendance.check_out_time.is_(None),
            )
            .count()
        )
