from datetime import datetime, date, timezone
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.attendance import Attendance, AttendanceStatus
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.user_repository import UserRepository
from app.repositories.leave_repository import LeaveRepository
from app.schemas.attendance import CheckInRequest, CheckOutRequest


class AttendanceService:
    def __init__(self, db: Session):
        self.db = db
        self.attendance_repo = AttendanceRepository(db)
        self.user_repo = UserRepository(db)
        self.leave_repo = LeaveRepository(db)

    def check_in(self, user_id: int, data: CheckInRequest) -> Attendance:
        today = date.today()
        now = datetime.now(timezone.utc)

        existing = self.attendance_repo.get_by_user_and_date(user_id, today)
        if existing and existing.check_in_time is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already checked in for today.",
            )

        if existing:
            existing.check_in_time = now
            existing.status = AttendanceStatus.PRESENT
            if data.remarks:
                existing.remarks = data.remarks
            return self.attendance_repo.update(existing)
        else:
            record = Attendance(
                user_id=user_id,
                date=today,
                check_in_time=now,
                check_out_time=None,
                total_hours=0.0,
                status=AttendanceStatus.PRESENT,
                remarks=data.remarks,
            )
            return self.attendance_repo.create(record)

    def check_out(self, user_id: int, data: CheckOutRequest) -> Attendance:
        today = date.today()
        now = datetime.now(timezone.utc)

        record = self.attendance_repo.get_by_user_and_date(user_id, today)
        if not record or record.check_in_time is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot check out without checking in first for today.",
            )

        if record.check_out_time is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already checked out for today.",
            )

        record.check_out_time = now
        # Calculate duration in hours
        check_in_dt = record.check_in_time
        if check_in_dt.tzinfo is None:
            check_in_dt = check_in_dt.replace(tzinfo=timezone.utc)
        duration_seconds = (now - check_in_dt).total_seconds()
        total_hours = max(0.0, round(duration_seconds / 3600.0, 2))
        record.total_hours = total_hours

        # If worked less than 4 hours, mark as HALF_DAY unless already custom
        if total_hours < 4.0:
            record.status = AttendanceStatus.HALF_DAY
        else:
            record.status = AttendanceStatus.PRESENT

        if data.remarks:
            record.remarks = f"{record.remarks} | {data.remarks}" if record.remarks else data.remarks

        return self.attendance_repo.update(record)

    def get_user_today(self, user_id: int) -> Optional[Attendance]:
        today = date.today()
        return self.attendance_repo.get_by_user_and_date(user_id, today)

    def get_user_history(
        self,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> List[Attendance]:
        return self.attendance_repo.list_by_user(user_id, start_date, end_date)

    def list_all_attendance(
        self,
        skip: int = 0,
        limit: int = 50,
        user_id: Optional[int] = None,
        target_date: Optional[date] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        status_filter: Optional[AttendanceStatus] = None,
    ) -> Tuple[List[Attendance], int]:
        return self.attendance_repo.list_all(
            skip=skip,
            limit=limit,
            user_id=user_id,
            target_date=target_date,
            start_date=start_date,
            end_date=end_date,
            status=status_filter,
        )

    def get_summary(self, target_date: Optional[date] = None) -> dict:
        t_date = target_date or date.today()
        total_employees = self.user_repo.count()
        present_count = self.attendance_repo.count_by_status_and_date(t_date, AttendanceStatus.PRESENT)
        half_day_count = self.attendance_repo.count_by_status_and_date(t_date, AttendanceStatus.HALF_DAY)
        on_leave_count = self.leave_repo.count_on_leave_today(t_date)
        active_checkins = self.attendance_repo.count_active_checkins(t_date)
        
        # Absent = total employees - (present + half-day + on leave)
        total_active_today = present_count + half_day_count + on_leave_count
        absent_count = max(0, total_employees - total_active_today)

        return {
            "date": t_date,
            "total_employees": total_employees,
            "present_today": present_count + half_day_count,
            "absent_today": absent_count,
            "on_leave_today": on_leave_count,
            "checked_in_active": active_checkins,
        }
