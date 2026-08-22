from datetime import datetime, timezone
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User, RoleEnum
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.notification import NotificationType
from app.repositories.leave_repository import LeaveRepository
from app.repositories.user_repository import UserRepository
from app.repositories.notification_repository import NotificationRepository
from app.schemas.leave import LeaveCreateRequest, LeaveStatusUpdateRequest


class LeaveService:
    def __init__(self, db: Session):
        self.db = db
        self.leave_repo = LeaveRepository(db)
        self.user_repo = UserRepository(db)
        self.notif_repo = NotificationRepository(db)

    def apply_leave(self, user_id: int, data: LeaveCreateRequest) -> LeaveRequest:
        # Check overlapping
        overlapping = self.leave_repo.find_overlapping(user_id, data.start_date, data.end_date)
        if overlapping:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an existing leave application covering these dates.",
            )

        days_count = (data.end_date - data.start_date).days + 1
        if days_count <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be on or after start date.",
            )

        leave = LeaveRequest(
            user_id=user_id,
            leave_type=data.leave_type,
            start_date=data.start_date,
            end_date=data.end_date,
            days_count=days_count,
            reason=data.reason.strip(),
            status=LeaveStatus.PENDING,
        )
        created_leave = self.leave_repo.create(leave)

        # Notify HR & Admins
        hr_admins = self.user_repo.get_hr_admin_users()
        for hr in hr_admins:
            self.notif_repo.create_notification(
                user_id=hr.id,
                title="New Leave Request Submitted",
                message=f"Leave request #{created_leave.id} submitted for {data.start_date} to {data.end_date} ({days_count} days).",
                notif_type=NotificationType.LEAVE,
                link=f"/leaves/{created_leave.id}",
            )

        return created_leave

    def get_leave_by_id(self, leave_id: int, current_user: User) -> LeaveRequest:
        leave = self.leave_repo.get_by_id(leave_id)
        if not leave:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Leave request #{leave_id} not found.",
            )

        if current_user.role == RoleEnum.EMPLOYEE and leave.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only view your own leave requests.",
            )
        return leave

    def update_status(
        self,
        leave_id: int,
        reviewer: User,
        data: LeaveStatusUpdateRequest,
    ) -> LeaveRequest:
        leave = self.leave_repo.get_by_id(leave_id)
        if not leave:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Leave request #{leave_id} not found.",
            )

        if leave.status != LeaveStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Leave request #{leave_id} has already been {leave.status.value.lower()}.",
            )

        leave.status = data.status
        leave.reviewer_id = reviewer.id
        leave.reviewer_comments = data.reviewer_comments
        leave.reviewed_at = datetime.now(timezone.utc)

        updated_leave = self.leave_repo.update(leave)

        # Send notification to applicant
        self.notif_repo.create_notification(
            user_id=leave.user_id,
            title=f"Leave Request {data.status.value}",
            message=f"Your leave request from {leave.start_date} to {leave.end_date} has been {data.status.value.lower()} by {reviewer.email}.",
            notif_type=NotificationType.LEAVE,
            link=f"/leaves/{leave.id}",
        )

        return updated_leave

    def cancel_leave(self, leave_id: int, current_user: User) -> None:
        leave = self.leave_repo.get_by_id(leave_id)
        if not leave:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Leave request #{leave_id} not found.",
            )

        if current_user.role == RoleEnum.EMPLOYEE and leave.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You cannot cancel another user's leave.",
            )

        if leave.status != LeaveStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PENDING leave requests can be cancelled.",
            )

        self.leave_repo.delete(leave)

    def list_my_leaves(self, user_id: int, status: Optional[LeaveStatus] = None) -> List[LeaveRequest]:
        return self.leave_repo.list_by_user(user_id, status)

    def list_all_leaves(
        self,
        skip: int = 0,
        limit: int = 50,
        user_id: Optional[int] = None,
        status: Optional[LeaveStatus] = None,
    ) -> Tuple[List[LeaveRequest], int]:
        return self.leave_repo.list_all(skip=skip, limit=limit, user_id=user_id, status=status)
