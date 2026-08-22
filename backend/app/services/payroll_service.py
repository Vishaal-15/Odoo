from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User, RoleEnum
from app.models.payroll import Payroll, PaymentStatus
from app.models.notification import NotificationType
from app.repositories.payroll_repository import PayrollRepository
from app.repositories.user_repository import UserRepository
from app.repositories.notification_repository import NotificationRepository
from app.schemas.payroll import PayrollCreateRequest, PayrollUpdateRequest


class PayrollService:
    def __init__(self, db: Session):
        self.db = db
        self.payroll_repo = PayrollRepository(db)
        self.user_repo = UserRepository(db)
        self.notif_repo = NotificationRepository(db)

    def create_payroll(self, data: PayrollCreateRequest) -> Payroll:
        target_user = self.user_repo.get_by_id(data.user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {data.user_id} not found.",
            )

        existing = self.payroll_repo.get_by_user_month_year(data.user_id, data.month, data.year)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payroll record for employee #{data.user_id} for period {data.month}/{data.year} already exists.",
            )

        allowances = data.allowances or 0.0
        deductions = data.deductions or 0.0
        net_salary = max(0.0, data.basic_salary + allowances - deductions)

        payroll = Payroll(
            user_id=data.user_id,
            month=data.month,
            year=data.year,
            basic_salary=data.basic_salary,
            allowances=allowances,
            deductions=deductions,
            net_salary=net_salary,
            payment_status=data.payment_status or PaymentStatus.PENDING,
            payment_date=data.payment_date,
            remarks=data.remarks,
        )
        created = self.payroll_repo.create(payroll)

        # Notify employee
        self.notif_repo.create_notification(
            user_id=data.user_id,
            title="Payroll Record Generated",
            message=f"Your payroll slip for {data.month}/{data.year} (Net: ${net_salary:,.2f}) has been generated.",
            notif_type=NotificationType.PAYROLL,
            link=f"/payroll/{created.id}",
        )

        return created

    def update_payroll(self, payroll_id: int, data: PayrollUpdateRequest) -> Payroll:
        payroll = self.payroll_repo.get_by_id(payroll_id)
        if not payroll:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Payroll record #{payroll_id} not found.",
            )

        if data.basic_salary is not None:
            payroll.basic_salary = data.basic_salary
        if data.allowances is not None:
            payroll.allowances = data.allowances
        if data.deductions is not None:
            payroll.deductions = data.deductions
        if data.payment_status is not None:
            payroll.payment_status = data.payment_status
        if data.payment_date is not None:
            payroll.payment_date = data.payment_date
        if data.remarks is not None:
            payroll.remarks = data.remarks

        # Recalculate net salary
        payroll.net_salary = max(0.0, payroll.basic_salary + payroll.allowances - payroll.deductions)

        return self.payroll_repo.update(payroll)

    def get_payroll_by_id(self, payroll_id: int, current_user: User) -> Payroll:
        payroll = self.payroll_repo.get_by_id(payroll_id)
        if not payroll:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Payroll record #{payroll_id} not found.",
            )

        if current_user.role == RoleEnum.EMPLOYEE and payroll.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only view your own payroll records.",
            )

        return payroll

    def list_my_payroll(self, user_id: int, year: Optional[int] = None) -> List[Payroll]:
        return self.payroll_repo.list_by_user(user_id, year)

    def list_all_payroll(
        self,
        skip: int = 0,
        limit: int = 50,
        user_id: Optional[int] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
        status_filter: Optional[PaymentStatus] = None,
    ) -> Tuple[List[Payroll], int]:
        return self.payroll_repo.list_all(
            skip=skip,
            limit=limit,
            user_id=user_id,
            month=month,
            year=year,
            status=status_filter,
        )
