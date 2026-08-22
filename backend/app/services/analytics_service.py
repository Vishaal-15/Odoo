from datetime import date, timedelta, datetime, timezone
import calendar
from typing import List, Dict, Any, Optional
from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.models.user import User, EmployeeProfile, RoleEnum
from app.models.attendance import Attendance, AttendanceStatus
from app.models.leave import LeaveRequest, LeaveStatus, LeaveType
from app.models.payroll import Payroll, PaymentStatus
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.leave_repository import LeaveRepository
from app.repositories.payroll_repository import PayrollRepository
from app.repositories.user_repository import UserRepository
from app.schemas.analytics import (
    OverviewStatsResponse,
    WorkforceAnalytics,
    AttendanceAnalyticsOverview,
    LeaveStatsOverview,
    PayrollSummaryOverview,
    WeeklyTrendItem,
    AttendanceTrendItem,
    LeaveTypeCountItem,
    LeaveBreakdownItem,
    DepartmentHeadcountItem,
    AttendanceAnalyticsResponse,
    LeaveAnalyticsResponse,
    EmployeeAnalyticsResponse,
    PayrollAnalyticsResponse,
)


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.attendance_repo = AttendanceRepository(db)
        self.leave_repo = LeaveRepository(db)
        self.payroll_repo = PayrollRepository(db)

    def get_overview_stats(self) -> OverviewStatsResponse:
        today = date.today()
        total_emp = self.db.query(User).filter(User.is_deleted == False).count()
        active_emp = self.db.query(User).filter(User.is_active == True, User.is_deleted == False).count()

        present_today = self.db.query(Attendance).filter(
            Attendance.date == today,
            Attendance.status.in_([AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY]),
        ).count()

        on_leave_today = self.db.query(LeaveRequest).filter(
            LeaveRequest.status == LeaveStatus.APPROVED,
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today,
        ).count()

        absent_today = max(0, total_emp - (present_today + on_leave_today))
        pending_leaves = self.db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.PENDING).count()

        # Monthly payroll outlay
        monthly_payroll = self.payroll_repo.get_monthly_total_expense(today.month, today.year)
        if monthly_payroll == 0.0:
            # Fallback to sum of base salaries if no payroll run yet
            base_sum = self.db.query(func.sum(EmployeeProfile.basic_salary)).scalar() or 0.0
            monthly_payroll = float(base_sum)

        # Average attendance rate
        attendance_rate = round((present_today / total_emp * 100), 1) if total_emp > 0 else 100.0

        # Department counts
        dept_counts_query = (
            self.db.query(EmployeeProfile.department, func.count(EmployeeProfile.id))
            .join(User, User.id == EmployeeProfile.user_id)
            .filter(User.is_deleted == False)
            .group_by(EmployeeProfile.department)
            .all()
        )
        dept_breakdown = [
            DepartmentHeadcountItem(department=dept or "General", count=cnt)
            for dept, cnt in dept_counts_query
        ]
        dept_count = len(dept_breakdown) if dept_breakdown else 1
        retention_rate = f"{round((active_emp / max(1, total_emp)) * 100, 1)}%"

        # Weekly attendance trend (past 5 working days)
        weekly_trend: List[WeeklyTrendItem] = []
        for i in range(4, -1, -1):
            day_date = today - timedelta(days=i)
            day_name = day_date.strftime("%a")
            p_cnt = self.db.query(Attendance).filter(
                Attendance.date == day_date,
                Attendance.status.in_([AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY]),
            ).count()
            l_cnt = self.db.query(LeaveRequest).filter(
                LeaveRequest.status == LeaveStatus.APPROVED,
                LeaveRequest.start_date <= day_date,
                LeaveRequest.end_date >= day_date,
            ).count()
            a_cnt = max(0, total_emp - (p_cnt + l_cnt))
            weekly_trend.append(WeeklyTrendItem(day=day_name, present=p_cnt, absent=a_cnt, leave=l_cnt))

        # Leave by type stats
        leave_counts = (
            self.db.query(LeaveRequest.leave_type, func.count(LeaveRequest.id))
            .group_by(LeaveRequest.leave_type)
            .all()
        )
        total_leave_reqs = sum(cnt for _, cnt in leave_counts) or 1
        color_map = {
            "PAID": ("bg-brand-500", "text-brand-400"),
            "SICK": ("bg-emerald-500", "text-emerald-400"),
            "CASUAL": ("bg-amber-500", "text-amber-400"),
            "UNPAID": ("bg-rose-500", "text-rose-400"),
        }
        leave_by_type = []
        for ltype, cnt in leave_counts:
            val = ltype.value if hasattr(ltype, "value") else str(ltype)
            colors = color_map.get(val, ("bg-brand-500", "text-brand-400"))
            pct = round((cnt / total_leave_reqs) * 100, 1)
            leave_by_type.append(
                LeaveTypeCountItem(
                    type=f"{val.capitalize()} Leave",
                    count=cnt,
                    percent=pct,
                    colorClass=colors[0],
                    textClass=colors[1],
                )
            )

        # Approved / Rejected this month
        first_of_month = today.replace(day=1)
        approved_this_month = self.db.query(LeaveRequest).filter(
            LeaveRequest.status == LeaveStatus.APPROVED,
            LeaveRequest.updated_at >= first_of_month,
        ).count()
        rejected_this_month = self.db.query(LeaveRequest).filter(
            LeaveRequest.status == LeaveStatus.REJECTED,
            LeaveRequest.updated_at >= first_of_month,
        ).count()

        # Payroll summary details
        avg_salary = round(monthly_payroll / max(1, active_emp), 2)
        pending_payrolls = self.db.query(Payroll).filter(
            Payroll.month == today.month,
            Payroll.year == today.year,
            Payroll.payment_status == PaymentStatus.PENDING,
        ).count()
        
        _, last_day = calendar.monthrange(today.year, today.month)
        next_pay_day = f"{today.year}-{today.month:02d}-{last_day:02d}"

        return OverviewStatsResponse(
            total_employees=total_emp,
            active_employees=active_emp,
            present_today=present_today,
            absent_today=absent_today,
            on_leave_today=on_leave_today,
            pending_leave_requests=pending_leaves,
            monthly_payroll_total=monthly_payroll,
            workforce=WorkforceAnalytics(
                totalEmployees=total_emp,
                activeEmployees=active_emp,
                departmentsCount=dept_count,
                retentionRate=retention_rate,
                departmentBreakdown=dept_breakdown,
            ),
            attendance=AttendanceAnalyticsOverview(
                todayPresent=present_today,
                todayAbsent=absent_today,
                todayOnLeave=on_leave_today,
                averageAttendanceRate=attendance_rate,
                weeklyTrend=weekly_trend,
            ),
            leaveStats=LeaveStatsOverview(
                pendingApprovals=pending_leaves,
                approvedThisMonth=approved_this_month,
                rejectedThisMonth=rejected_this_month,
                byType=leave_by_type,
            ),
            payrollSummary=PayrollSummaryOverview(
                totalPayrollExpense=monthly_payroll,
                averageSalary=avg_salary,
                pendingDisbursements=pending_payrolls,
                nextPayDay=next_pay_day,
            ),
        )

    def get_attendance_analytics(self) -> AttendanceAnalyticsResponse:
        overview = self.get_overview_stats()
        daily_trends = self.get_attendance_trends(days=14)

        return AttendanceAnalyticsResponse(
            total_employees=overview.total_employees,
            present_today=overview.present_today,
            absent_today=overview.absent_today,
            half_day_today=self.db.query(Attendance).filter(
                Attendance.date == date.today(),
                Attendance.status == AttendanceStatus.HALF_DAY,
            ).count(),
            on_leave_today=overview.on_leave_today,
            attendance_rate=overview.attendance.averageAttendanceRate if overview.attendance else 0.0,
            weekly_trend=overview.attendance.weeklyTrend if overview.attendance else [],
            daily_trend=daily_trends,
        )

    def get_attendance_trends(self, days: int = 7) -> List[AttendanceTrendItem]:
        today = date.today()
        start_date = today - timedelta(days=days - 1)
        results: List[AttendanceTrendItem] = []
        current_date = start_date

        total_emp = self.db.query(User).filter(User.is_deleted == False).count()

        while current_date <= today:
            p_cnt = self.db.query(Attendance).filter(
                Attendance.date == current_date,
                Attendance.status == AttendanceStatus.PRESENT,
            ).count()
            h_cnt = self.db.query(Attendance).filter(
                Attendance.date == current_date,
                Attendance.status == AttendanceStatus.HALF_DAY,
            ).count()
            a_cnt = self.db.query(Attendance).filter(
                Attendance.date == current_date,
                Attendance.status == AttendanceStatus.ABSENT,
            ).count()
            # If not explicitly recorded as ABSENT in DB, count remainder as absent
            if a_cnt == 0 and (p_cnt + h_cnt) < total_emp:
                l_cnt = self.db.query(LeaveRequest).filter(
                    LeaveRequest.status == LeaveStatus.APPROVED,
                    LeaveRequest.start_date <= current_date,
                    LeaveRequest.end_date >= current_date,
                ).count()
                a_cnt = max(0, total_emp - (p_cnt + h_cnt + l_cnt))

            results.append(
                AttendanceTrendItem(
                    date=current_date,
                    present_count=p_cnt,
                    absent_count=a_cnt,
                    half_day_count=h_cnt,
                )
            )
            current_date += timedelta(days=1)

        return results

    def get_leave_analytics(self) -> LeaveAnalyticsResponse:
        total_requests = self.db.query(LeaveRequest).count()
        pending = self.db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.PENDING).count()
        approved = self.db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.APPROVED).count()
        rejected = self.db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.REJECTED).count()

        counts = (
            self.db.query(LeaveRequest.leave_type, func.count(LeaveRequest.id))
            .group_by(LeaveRequest.leave_type)
            .all()
        )
        total_denom = max(1, total_requests)
        breakdown_by_type = [
            LeaveTypeCountItem(
                type=ltype.value if hasattr(ltype, "value") else str(ltype),
                count=cnt,
                percent=round((cnt / total_denom) * 100, 1),
            )
            for ltype, cnt in counts
        ]

        # Department leave stats
        dept_leaves = (
            self.db.query(EmployeeProfile.department, func.count(LeaveRequest.id))
            .join(User, User.id == EmployeeProfile.user_id)
            .join(LeaveRequest, LeaveRequest.user_id == User.id)
            .group_by(EmployeeProfile.department)
            .all()
        )
        dept_stats = [{"department": d or "General", "total_leaves": cnt} for d, cnt in dept_leaves]

        return LeaveAnalyticsResponse(
            total_requests=total_requests,
            pending_count=pending,
            approved_count=approved,
            rejected_count=rejected,
            breakdown_by_type=breakdown_by_type,
            department_stats=dept_stats,
        )

    def get_employee_analytics(self) -> EmployeeAnalyticsResponse:
        total_emp = self.db.query(User).filter(User.is_deleted == False).count()
        active_emp = self.db.query(User).filter(User.is_active == True, User.is_deleted == False).count()
        inactive_emp = total_emp - active_emp

        dept_counts = (
            self.db.query(EmployeeProfile.department, func.count(EmployeeProfile.id))
            .join(User, User.id == EmployeeProfile.user_id)
            .filter(User.is_deleted == False)
            .group_by(EmployeeProfile.department)
            .all()
        )
        headcounts = [
            DepartmentHeadcountItem(department=dept or "General", count=cnt)
            for dept, cnt in dept_counts
        ]

        role_counts = (
            self.db.query(User.role, func.count(User.id))
            .filter(User.is_deleted == False)
            .group_by(User.role)
            .all()
        )
        role_dist = {r.value if hasattr(r, "value") else str(r): cnt for r, cnt in role_counts}
        retention = f"{round((active_emp / max(1, total_emp)) * 100, 1)}%"

        return EmployeeAnalyticsResponse(
            total_employees=total_emp,
            active_employees=active_emp,
            inactive_employees=inactive_emp,
            retention_rate=retention,
            departments_count=len(headcounts),
            department_headcounts=headcounts,
            role_distribution=role_dist,
        )

    def get_payroll_analytics(self) -> PayrollAnalyticsResponse:
        today = date.today()
        total_outlay = self.payroll_repo.get_monthly_total_expense(today.month, today.year)
        active_emp = self.db.query(User).filter(User.is_active == True, User.is_deleted == False).count()
        
        if total_outlay == 0.0:
            base_sum = self.db.query(func.sum(EmployeeProfile.basic_salary)).scalar() or 0.0
            total_outlay = float(base_sum)

        avg_salary = round(total_outlay / max(1, active_emp), 2)
        
        processed = self.db.query(Payroll).filter(
            Payroll.month == today.month,
            Payroll.year == today.year,
            Payroll.payment_status.in_([PaymentStatus.PROCESSED, PaymentStatus.PAID]),
        ).count()

        pending = self.db.query(Payroll).filter(
            Payroll.month == today.month,
            Payroll.year == today.year,
            Payroll.payment_status == PaymentStatus.PENDING,
        ).count()

        _, last_day = calendar.monthrange(today.year, today.month)
        next_pay_day = f"{today.year}-{today.month:02d}-{last_day:02d}"

        dept_payroll = (
            self.db.query(
                EmployeeProfile.department,
                func.sum(EmployeeProfile.basic_salary),
                func.count(EmployeeProfile.id),
            )
            .join(User, User.id == EmployeeProfile.user_id)
            .filter(User.is_deleted == False)
            .group_by(EmployeeProfile.department)
            .all()
        )
        dept_outlay = [
            {"department": d or "General", "total_salary": float(tot or 0.0), "headcount": cnt}
            for d, tot, cnt in dept_payroll
        ]

        return PayrollAnalyticsResponse(
            total_monthly_outlay=total_outlay,
            average_salary=avg_salary,
            pending_disbursements=pending,
            processed_count=processed,
            next_pay_day=next_pay_day,
            department_outlay=dept_outlay,
        )
