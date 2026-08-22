from typing import Optional, List, Tuple
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.payroll import Payroll, PaymentStatus
from app.repositories.base import BaseRepository


class PayrollRepository(BaseRepository[Payroll]):
    def __init__(self, db: Session):
        super().__init__(Payroll, db)

    def get_by_id(self, payroll_id: int) -> Optional[Payroll]:
        return self.db.query(Payroll).filter(Payroll.id == payroll_id).first()

    def get_by_user_month_year(self, user_id: int, month: int, year: int) -> Optional[Payroll]:
        return (
            self.db.query(Payroll)
            .filter(Payroll.user_id == user_id, Payroll.month == month, Payroll.year == year)
            .first()
        )

    def list_by_user(self, user_id: int, year: Optional[int] = None) -> List[Payroll]:
        query = self.db.query(Payroll).filter(Payroll.user_id == user_id)
        if year:
            query = query.filter(Payroll.year == year)
        return query.order_by(Payroll.year.desc(), Payroll.month.desc()).all()

    def list_all(
        self,
        skip: int = 0,
        limit: int = 50,
        user_id: Optional[int] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
        status: Optional[PaymentStatus] = None,
    ) -> Tuple[List[Payroll], int]:
        query = self.db.query(Payroll)
        if user_id:
            query = query.filter(Payroll.user_id == user_id)
        if month:
            query = query.filter(Payroll.month == month)
        if year:
            query = query.filter(Payroll.year == year)
        if status:
            query = query.filter(Payroll.payment_status == status)

        total = query.count()
        items = query.order_by(Payroll.year.desc(), Payroll.month.desc(), Payroll.id.desc()).offset(skip).limit(limit).all()
        return items, total

    def get_monthly_total_expense(self, month: int, year: int) -> float:
        result = (
            self.db.query(func.sum(Payroll.net_salary))
            .filter(Payroll.month == month, Payroll.year == year)
            .scalar()
        )
        return float(result) if result is not None else 0.0
