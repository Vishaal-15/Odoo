import io
import csv
from datetime import date, datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, EmployeeProfile, RoleEnum
from app.models.attendance import Attendance, AttendanceStatus
from app.models.leave import LeaveRequest, LeaveStatus, LeaveType
from app.models.payroll import Payroll, PaymentStatus
from app.schemas.reports import (
    ReportSummaryItem,
    AttendanceReportRow,
    LeaveReportRow,
    EmployeeReportRow,
    PayrollReportRow,
    ReportExportRequest,
    ReportExportResponse,
)


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def get_reports_summary(self) -> List[ReportSummaryItem]:
        today = date.today()
        # Count actual entities to give realistic sizes/records
        att_count = self.db.query(Attendance).count()
        payroll_count = self.db.query(Payroll).count()
        leave_count = self.db.query(LeaveRequest).count()
        emp_count = self.db.query(User).filter(User.is_deleted == False).count()

        return [
            ReportSummaryItem(
                id=1,
                name=f"Monthly Attendance Register - {today.strftime('%b %Y')}",
                title=f"Monthly Attendance Register - {today.strftime('%b %Y')}",
                category="Attendance",
                type="Monthly Attendance",
                date=today.isoformat(),
                size=f"{max(1, att_count * 120 // 1024)} KB",
                status="Active",
                format="CSV",
            ),
            ReportSummaryItem(
                id=2,
                name=f"Payroll Statement & Tax Summary - {today.strftime('%b %Y')}",
                title=f"Payroll Statement & Tax Summary - {today.strftime('%b %Y')}",
                category="Payroll",
                type="Payroll Statement",
                date=today.isoformat(),
                size=f"{max(1, payroll_count * 180 // 1024)} KB",
                status="Processed",
                format="CSV",
            ),
            ReportSummaryItem(
                id=3,
                name=f"Annual Leave Quota & Time-Off Audit {today.year}",
                title=f"Annual Leave Quota & Time-Off Audit {today.year}",
                category="Leave",
                type="Leave Audit",
                date=today.isoformat(),
                size=f"{max(1, leave_count * 140 // 1024)} KB",
                status="Active",
                format="CSV",
            ),
            ReportSummaryItem(
                id=4,
                name="Workforce Headcount & Diversity Roster",
                title="Workforce Headcount & Diversity Roster",
                category="Headcount",
                type="Employee Roster",
                date=today.isoformat(),
                size=f"{max(1, emp_count * 210 // 1024)} KB",
                status="Verified",
                format="CSV",
            ),
        ]

    def get_attendance_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        department: Optional[str] = None,
        employee_id: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> List[AttendanceReportRow]:
        query = (
            self.db.query(Attendance, User, EmployeeProfile)
            .join(User, User.id == Attendance.user_id)
            .outerjoin(EmployeeProfile, EmployeeProfile.user_id == User.id)
            .filter(User.is_deleted == False)
        )

        if start_date:
            query = query.filter(Attendance.date >= start_date)
        if end_date:
            query = query.filter(Attendance.date <= end_date)
        if department:
            query = query.filter(EmployeeProfile.department.ilike(f"%{department}%"))
        if employee_id:
            query = query.filter(User.employee_id == employee_id)
        if status_filter:
            query = query.filter(Attendance.status == status_filter)

        results = query.order_by(Attendance.date.desc()).all()
        rows: List[AttendanceReportRow] = []

        for att, user, prof in results:
            full_name = f"{prof.first_name} {prof.last_name}" if prof else user.email
            dept_name = prof.department if prof else "General"
            cin = att.check_in_time.strftime("%H:%M:%S") if att.check_in_time else None
            cout = att.check_out_time.strftime("%H:%M:%S") if att.check_out_time else None

            rows.append(
                AttendanceReportRow(
                    id=att.id,
                    employee_id=user.employee_id,
                    employee_name=full_name,
                    department=dept_name,
                    date=att.date,
                    check_in=cin,
                    check_out=cout,
                    total_hours=float(att.total_hours or 0.0),
                    status=att.status.value if hasattr(att.status, "value") else str(att.status),
                    remarks=att.remarks,
                )
            )

        return rows

    def get_leave_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        department: Optional[str] = None,
        leave_type: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> List[LeaveReportRow]:
        query = (
            self.db.query(LeaveRequest, User, EmployeeProfile)
            .join(User, User.id == LeaveRequest.user_id)
            .outerjoin(EmployeeProfile, EmployeeProfile.user_id == User.id)
            .filter(User.is_deleted == False)
        )

        if start_date:
            query = query.filter(LeaveRequest.start_date >= start_date)
        if end_date:
            query = query.filter(LeaveRequest.end_date <= end_date)
        if department:
            query = query.filter(EmployeeProfile.department.ilike(f"%{department}%"))
        if leave_type:
            query = query.filter(LeaveRequest.leave_type == leave_type)
        if status_filter:
            query = query.filter(LeaveRequest.status == status_filter)

        results = query.order_by(LeaveRequest.created_at.desc()).all()
        rows: List[LeaveReportRow] = []

        for leave, user, prof in results:
            full_name = f"{prof.first_name} {prof.last_name}" if prof else user.email
            dept_name = prof.department if prof else "General"
            ltype_val = leave.leave_type.value if hasattr(leave.leave_type, "value") else str(leave.leave_type)
            lstat_val = leave.status.value if hasattr(leave.status, "value") else str(leave.status)

            rows.append(
                LeaveReportRow(
                    id=leave.id,
                    employee_id=user.employee_id,
                    employee_name=full_name,
                    department=dept_name,
                    leave_type=ltype_val,
                    start_date=leave.start_date,
                    end_date=leave.end_date,
                    days_count=float(leave.days_count),
                    reason=leave.reason,
                    status=lstat_val,
                    reviewer_comments=leave.reviewer_comments,
                    applied_at=leave.created_at,
                )
            )

        return rows

    def get_employee_report(
        self,
        department: Optional[str] = None,
        role: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> List[EmployeeReportRow]:
        query = (
            self.db.query(User, EmployeeProfile)
            .outerjoin(EmployeeProfile, EmployeeProfile.user_id == User.id)
            .filter(User.is_deleted == False)
        )

        if department:
            query = query.filter(EmployeeProfile.department.ilike(f"%{department}%"))
        if role:
            query = query.filter(User.role == role)
        if status_filter == "ACTIVE":
            query = query.filter(User.is_active == True)
        elif status_filter == "INACTIVE":
            query = query.filter(User.is_active == False)

        results = query.order_by(User.employee_id.asc()).all()
        rows: List[EmployeeReportRow] = []

        for user, prof in results:
            full_name = f"{prof.first_name} {prof.last_name}" if prof else user.email
            dept = prof.department if prof else "General"
            desig = prof.designation if prof else "Staff"
            jdate = prof.joining_date if prof else user.created_at.date()
            sal = float(prof.basic_salary) if prof else 0.0
            ph = prof.phone if prof else None
            role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
            stat = "ACTIVE" if user.is_active else "INACTIVE"

            rows.append(
                EmployeeReportRow(
                    id=user.id,
                    employee_id=user.employee_id,
                    full_name=full_name,
                    email=user.email,
                    department=dept,
                    designation=desig,
                    role=role_val,
                    joining_date=jdate,
                    basic_salary=sal,
                    phone=ph,
                    status=stat,
                )
            )

        return rows

    def get_payroll_report(
        self,
        month: Optional[int] = None,
        year: Optional[int] = None,
        department: Optional[str] = None,
        payment_status: Optional[str] = None,
    ) -> List[PayrollReportRow]:
        query = (
            self.db.query(Payroll, User, EmployeeProfile)
            .join(User, User.id == Payroll.user_id)
            .outerjoin(EmployeeProfile, EmployeeProfile.user_id == User.id)
            .filter(User.is_deleted == False)
        )

        if month:
            query = query.filter(Payroll.month == month)
        if year:
            query = query.filter(Payroll.year == year)
        if department:
            query = query.filter(EmployeeProfile.department.ilike(f"%{department}%"))
        if payment_status:
            query = query.filter(Payroll.payment_status == payment_status)

        results = query.order_by(Payroll.year.desc(), Payroll.month.desc()).all()
        rows: List[PayrollReportRow] = []

        for pay, user, prof in results:
            full_name = f"{prof.first_name} {prof.last_name}" if prof else user.email
            dept = prof.department if prof else "General"
            pay_period = f"{date(pay.year, pay.month, 1).strftime('%B %Y')}"
            stat_val = pay.payment_status.value if hasattr(pay.payment_status, "value") else str(pay.payment_status)

            rows.append(
                PayrollReportRow(
                    id=pay.id,
                    employee_id=user.employee_id,
                    employee_name=full_name,
                    department=dept,
                    month=pay.month,
                    year=pay.year,
                    pay_period=pay_period,
                    base_salary=float(pay.basic_salary),
                    allowances=float(pay.allowances),
                    deductions=float(pay.deductions),
                    net_salary=float(pay.net_salary),
                    payment_status=stat_val,
                    payment_date=pay.payment_date,
                )
            )

        return rows

    def export_report(self, req: ReportExportRequest) -> ReportExportResponse:
        rtype = req.report_type.lower()
        now = datetime.now(timezone.utc)
        ts = now.strftime("%Y%m%d_%H%M%S")

        output = io.StringIO()
        writer = csv.writer(output)
        records_count = 0
        filename = f"report_{rtype}_{ts}.csv"

        if "attendance" in rtype:
            filename = f"attendance_register_{ts}.csv"
            records = self.get_attendance_report(
                start_date=req.start_date,
                end_date=req.end_date,
                department=req.department,
                status_filter=req.status,
            )
            records_count = len(records)
            writer.writerow(["ID", "Employee ID", "Employee Name", "Department", "Date", "Check In", "Check Out", "Hours", "Status", "Remarks"])
            for r in records:
                writer.writerow([r.id, r.employee_id, r.employee_name, r.department, r.date, r.check_in, r.check_out, r.total_hours, r.status, r.remarks])

        elif "leave" in rtype:
            filename = f"leave_audit_{ts}.csv"
            records = self.get_leave_report(
                start_date=req.start_date,
                end_date=req.end_date,
                department=req.department,
                status_filter=req.status,
            )
            records_count = len(records)
            writer.writerow(["ID", "Employee ID", "Employee Name", "Department", "Leave Type", "Start Date", "End Date", "Days", "Reason", "Status", "Reviewer Comments"])
            for r in records:
                writer.writerow([r.id, r.employee_id, r.employee_name, r.department, r.leave_type, r.start_date, r.end_date, r.days_count, r.reason, r.status, r.reviewer_comments])

        elif "payroll" in rtype:
            filename = f"payroll_statement_{ts}.csv"
            records = self.get_payroll_report(
                month=req.month,
                year=req.year,
                department=req.department,
                payment_status=req.status,
            )
            records_count = len(records)
            writer.writerow(["ID", "Employee ID", "Employee Name", "Department", "Pay Period", "Base Salary", "Allowances", "Deductions", "Net Salary", "Payment Status", "Payment Date"])
            for r in records:
                writer.writerow([r.id, r.employee_id, r.employee_name, r.department, r.pay_period, r.base_salary, r.allowances, r.deductions, r.net_salary, r.payment_status, r.payment_date])

        else:
            filename = f"employee_roster_{ts}.csv"
            records = self.get_employee_report(
                department=req.department,
                status_filter=req.status,
            )
            records_count = len(records)
            writer.writerow(["ID", "Employee ID", "Full Name", "Email", "Department", "Designation", "Role", "Joining Date", "Basic Salary", "Phone", "Status"])
            for r in records:
                writer.writerow([r.id, r.employee_id, r.full_name, r.email, r.department, r.designation, r.role, r.joining_date, r.basic_salary, r.phone, r.status])

        csv_content = output.getvalue()
        output.close()

        return ReportExportResponse(
            report_type=req.report_type,
            format=req.format.lower(),
            filename=filename,
            total_records=records_count,
            generated_at=now,
            message=f"Successfully generated {req.report_type} report with {records_count} records.",
            content=csv_content,
            download_url=f"/api/v1/reports/download/{filename}",
        )
