"""
Dayflow HRMS - Backend Seed Utility
Populates hackathon team accounts, attendance, leaves, payroll, and notifications.
"""
import logging
from datetime import date, datetime, timedelta, timezone
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, RoleEnum, EmployeeProfile
from app.models.attendance import Attendance, AttendanceStatus
from app.models.leave import LeaveRequest, LeaveType, LeaveStatus
from app.models.payroll import Payroll, PaymentStatus
from app.models.notification import Notification, NotificationType

logger = logging.getLogger("dayflow-seed")


def seed_default_data(force: bool = False):
    """Initializes tables and seeds team data. Pass force=True to wipe and reseed."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        user_count = db.query(User).count()
        if user_count > 0 and not force:
            logger.info(f"Database already populated ({user_count} users). Skipping seed.")
            return

        if force and user_count > 0:
            logger.info("Force reseed: clearing existing records...")
            db.query(Notification).delete()
            db.query(Payroll).delete()
            db.query(LeaveRequest).delete()
            db.query(Attendance).delete()
            db.query(EmployeeProfile).delete()
            db.query(User).delete()
            db.commit()

        logger.info("Seeding hackathon team accounts and records...")

        admin_hash = get_password_hash("Admin@123")
        hr_hash = get_password_hash("Hr@123")
        emp_hash = get_password_hash("Employee@123")

        users_data = [
            {
                "employee_id": "EMP-001",
                "email": "vishaal@dayflow.com",
                "hashed_password": admin_hash,
                "role": RoleEnum.ADMIN,
                "first_name": "Vishaal",
                "last_name": "A K",
                "department": "Engineering",
                "designation": "Senior Full-Stack Engineer",
                "phone": "+91 98765 43210",
                "basic_salary": 110000.0,
            },
            {
                "employee_id": "EMP-002",
                "email": "sharan@dayflow.com",
                "hashed_password": hr_hash,
                "role": RoleEnum.HR,
                "first_name": "Sharan",
                "last_name": "B",
                "department": "Sales & Marketing",
                "designation": "Senior Marketing Strategist",
                "phone": "+91 98765 43211",
                "basic_salary": 80000.0,
            },
            {
                "employee_id": "EMP-003",
                "email": "saaral@dayflow.com",
                "hashed_password": emp_hash,
                "role": RoleEnum.EMPLOYEE,
                "first_name": "Saaral",
                "last_name": "S",
                "department": "Engineering",
                "designation": "Product UI/UX Designer",
                "phone": "+91 98765 43212",
                "basic_salary": 85000.0,
            },
            {
                "employee_id": "EMP-004",
                "email": "sreevanth@dayflow.com",
                "hashed_password": emp_hash,
                "role": RoleEnum.EMPLOYEE,
                "first_name": "Sreevanth",
                "last_name": "K",
                "department": "Finance & Operations",
                "designation": "Lead Financial Analyst",
                "phone": "+91 98765 43213",
                "basic_salary": 98000.0,
            },
        ]

        created_users = []
        for u_data in users_data:
            user = User(
                employee_id=u_data["employee_id"],
                email=u_data["email"],
                hashed_password=u_data["hashed_password"],
                role=u_data["role"],
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.flush()

            profile = EmployeeProfile(
                user_id=user.id,
                first_name=u_data["first_name"],
                last_name=u_data["last_name"],
                phone=u_data["phone"],
                department=u_data["department"],
                designation=u_data["designation"],
                basic_salary=u_data["basic_salary"],
                joining_date=date(2023, 1, 15),
            )
            db.add(profile)
            created_users.append(user)

        db.flush()
        admin_user = created_users[0]
        hr_user = created_users[1]
        saaral_user = created_users[2]
        sreevanth_user = created_users[3]

        today = date.today()
        for i in range(7):
            att_date = today - timedelta(days=i)
            if att_date.weekday() == 6:
                continue

            for u in created_users:
                check_in = datetime.combine(att_date, datetime.min.time(), tzinfo=timezone.utc).replace(hour=9, minute=0)
                check_out = datetime.combine(att_date, datetime.min.time(), tzinfo=timezone.utc).replace(hour=17, minute=30)

                if att_date == today and u.id == saaral_user.id:
                    att = Attendance(
                        user_id=u.id,
                        date=att_date,
                        check_in_time=check_in,
                        check_out_time=None,
                        total_hours=4.5,
                        status=AttendanceStatus.PRESENT,
                    )
                else:
                    att = Attendance(
                        user_id=u.id,
                        date=att_date,
                        check_in_time=check_in,
                        check_out_time=check_out,
                        total_hours=8.5,
                        status=AttendanceStatus.PRESENT,
                    )
                db.add(att)

        leaves_data = [
            {
                "user_id": saaral_user.id,
                "leave_type": LeaveType.PAID,
                "start_date": today + timedelta(days=5),
                "end_date": today + timedelta(days=7),
                "days_count": 3,
                "reason": "Personal time off for family event",
                "status": LeaveStatus.PENDING,
            },
            {
                "user_id": sreevanth_user.id,
                "leave_type": LeaveType.SICK,
                "start_date": today - timedelta(days=15),
                "end_date": today - timedelta(days=14),
                "days_count": 2,
                "reason": "Medical appointment and recovery",
                "status": LeaveStatus.APPROVED,
                "reviewer_id": hr_user.id,
                "reviewer_comments": "Approved. Get well soon.",
                "reviewed_at": datetime.now(timezone.utc) - timedelta(days=14),
            },
        ]

        for l_data in leaves_data:
            db.add(LeaveRequest(**l_data))

        cur_month = today.month
        cur_year = today.year
        prev_month = 12 if cur_month == 1 else cur_month - 1
        prev_year = cur_year - 1 if cur_month == 1 else cur_year

        for u in created_users:
            basic = u.profile.basic_salary or 80000.0
            allowances = round(basic * 0.2, 2)
            deductions = round(basic * 0.1, 2)
            net = basic + allowances - deductions

            db.add(Payroll(
                user_id=u.id,
                month=prev_month,
                year=prev_year,
                basic_salary=basic,
                allowances=allowances,
                deductions=deductions,
                net_salary=net,
                payment_status=PaymentStatus.PAID,
                payment_date=date(prev_year, prev_month, 28),
                remarks="Monthly salary processed",
            ))
            db.add(Payroll(
                user_id=u.id,
                month=cur_month,
                year=cur_year,
                basic_salary=basic,
                allowances=allowances,
                deductions=deductions,
                net_salary=net,
                payment_status=PaymentStatus.PROCESSED,
                remarks="Ready for disbursement",
            ))

        notifs_data = [
            {
                "user_id": saaral_user.id,
                "title": "Welcome to Dayflow HRMS",
                "message": "Your profile has been fully set up in the system.",
                "type": NotificationType.GENERAL,
                "is_read": False,
            },
            {
                "user_id": hr_user.id,
                "title": "New Leave Application",
                "message": "Saaral submitted a Paid Leave application for review.",
                "type": NotificationType.LEAVE,
                "is_read": False,
            },
            {
                "user_id": sreevanth_user.id,
                "title": "Leave Request Approved",
                "message": "Your Sick Leave request has been approved by HR.",
                "type": NotificationType.LEAVE,
                "is_read": False,
            },
        ]

        for n_data in notifs_data:
            db.add(Notification(**n_data))

        db.commit()
        logger.info(f"Database seeding completed successfully! Seeded {len(created_users)} team members.")

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to seed database: {e}", exc_info=True)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_default_data(force=True)
