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

    def generate_monthly_payroll_batch(
        self,
        month: Optional[int] = None,
        year: Optional[int] = None,
        working_days: int = 22,
        pay_period: Optional[str] = None,
    ) -> dict:
        """
        Calculates and generates monthly payroll for all active employees using attendance & leave data.
        - Days Present / Late: 1.0 Day
        - Half Day: 0.5 Day
        - Paid Leaves: Full Credit
        - Unpaid Leaves / Absenteeism: Loss of Pay (LOP) deduction = (Basic / working_days) * absent_days
        - Overtime: (Hourly Rate * 1.5) * Overtime Hours
        """
        import calendar
        from datetime import date
        from app.models.attendance import Attendance, AttendanceStatus
        from app.models.leave import LeaveRequest, LeaveStatus, LeaveType

        today = date.today()
        target_month = month or today.month
        target_year = year or today.year

        # Parse string pay_period like "August 2026" if passed
        if pay_period and not month:
            parts = pay_period.split()
            if len(parts) >= 2:
                try:
                    month_name, year_str = parts[0], parts[1]
                    datetime_obj = datetime.strptime(month_name, "%B")
                    target_month = datetime_obj.month
                    target_year = int(year_str)
                except Exception:
                    pass

        # Determine date range for target month
        _, num_days = calendar.monthrange(target_year, target_month)
        start_date = date(target_year, target_month, 1)
        end_date = date(target_year, target_month, num_days)

        active_users = self.db.query(User).filter(User.is_active == True).all()
        generated_count = 0
        total_outlay = 0.0

        for user in active_users:
            profile = user.profile
            base_salary = float(profile.basic_salary) if profile and profile.basic_salary else 50000.0
            daily_rate = base_salary / max(1, working_days)
            hourly_rate = daily_rate / 8.0

            # 1. Attendance logs in this period
            attendances = (
                self.db.query(Attendance)
                .filter(
                    Attendance.user_id == user.id,
                    Attendance.date >= start_date,
                    Attendance.date <= end_date,
                )
                .all()
            )

            present_days = sum(
                1.0 for a in attendances if a.status == AttendanceStatus.PRESENT
            )
            half_days = sum(0.5 for a in attendances if a.status == AttendanceStatus.HALF_DAY)
            overtime_hours = sum(max(0.0, float(a.total_hours or 8.0) - 8.0) for a in attendances)



            # 2. Approved Leaves in this period
            leaves = (
                self.db.query(LeaveRequest)
                .filter(
                    LeaveRequest.user_id == user.id,
                    LeaveRequest.status == LeaveStatus.APPROVED,
                    LeaveRequest.start_date <= end_date,
                    LeaveRequest.end_date >= start_date,
                )
                .all()
            )

            paid_leave_days = sum(
                float(l.days_count or 1) for l in leaves if l.leave_type != LeaveType.UNPAID
            )
            unpaid_leave_days = sum(
                float(l.days_count or 1) for l in leaves if l.leave_type == LeaveType.UNPAID
            )


            # 3. Compute Attendance-based deductions & credits
            total_credited_days = present_days + half_days + paid_leave_days

            if attendances:
                # Actual attendance tracking is active for this period
                absent_days = max(0.0, float(working_days) - total_credited_days)
            else:
                # If no punch logs exist yet for this month (e.g. forward projection)
                absent_days = unpaid_leave_days
                total_credited_days = max(0.0, float(working_days) - absent_days)

            # LOP (Loss of Pay) deduction
            lop_deduction = round(absent_days * daily_rate, 2)

            # Overtime allowance
            overtime_allowance = round(overtime_hours * hourly_rate * 1.5, 2)

            # Standard Allowances (HRA: 20%, Special Allowance: 10% + Overtime)
            hra = round(base_salary * 0.20, 2)
            special_allowance = round(base_salary * 0.10, 2)
            total_allowances = round(hra + special_allowance + overtime_allowance, 2)

            # Statutory Deductions (PF: 12%, Professional Tax: ₹200 + LOP)
            pf_deduction = round(base_salary * 0.12, 2)
            prof_tax = 200.0
            total_deductions = round(pf_deduction + prof_tax + lop_deduction, 2)

            net_salary = max(0.0, round(base_salary + total_allowances - total_deductions, 2))

            remarks = (
                f"Working Days: {working_days} | Attended: {int(present_days)} | "
                f"Paid Leaves: {int(paid_leave_days)} | Absent/LOP: {absent_days:.1f} (-₹{lop_deduction:,.2f}) | "
                f"OT: {overtime_hours:.1f}h (+₹{overtime_allowance:,.2f})"
            )

            # Check if payroll already exists for this period
            existing = self.payroll_repo.get_by_user_month_year(user.id, target_month, target_year)
            if existing:
                existing.basic_salary = base_salary
                existing.allowances = total_allowances
                existing.deductions = total_deductions
                existing.net_salary = net_salary
                existing.remarks = remarks
                existing.payment_date = end_date
                self.payroll_repo.update(existing)
            else:
                new_payroll = Payroll(
                    user_id=user.id,
                    month=target_month,
                    year=target_year,
                    basic_salary=base_salary,
                    allowances=total_allowances,
                    deductions=total_deductions,
                    net_salary=net_salary,
                    payment_status=PaymentStatus.PENDING,
                    payment_date=end_date,
                    remarks=remarks,
                )
                created = self.payroll_repo.create(new_payroll)
                # Dispatch notification
                self.notif_repo.create_notification(
                    user_id=user.id,
                    title="Monthly Payslip Generated",
                    message=f"Payslip for {calendar.month_name[target_month]} {target_year} (Net: ₹{net_salary:,.2f}) has been generated.",
                    notif_type=NotificationType.PAYROLL,
                    link=f"/payroll/{created.id}",
                )

            generated_count += 1
            total_outlay += net_salary

        month_title = f"{calendar.month_name[target_month]} {target_year}"
        return {
            "message": f"Payroll cycle for {month_title} successfully executed based on attendance records.",
            "month": target_month,
            "year": target_year,
            "generated_count": generated_count,
            "total_outlay": total_outlay,
        }

