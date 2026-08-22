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
                "employee_id": "OIVIAK20230001",
                "email": "vishaal@dayflow.com",
                "hashed_password": admin_hash,
                "role": RoleEnum.ADMIN,
                "first_name": "Vishaal",
                "last_name": "A K",
                "company_name": "Odoo India",
                "department": "Engineering",
                "designation": "Senior Full-Stack Engineer",
                "manager_name": "Senthil Kumar",
                "location": "Bangalore Office",
                "phone": "+91 98765 43210",
                "basic_salary": 50000.0,
                "about": "Passionate full-stack systems architect with deep expertise in scalable web apps and cloud databases.",
                "what_i_love": "Building high-performance, resilient systems and intuitive user interfaces.",
                "interests_and_hobbies": "Open-source development, chess, badminton, and photography.",
                "skills": "Python, React, FastAPI, PostgreSQL, Docker, Vite, TailwindCSS",
                "certifications": "AWS Certified Solutions Architect, PostgreSQL Professional Developer",
                "date_of_birth": date(1998, 5, 14),
                "nationality": "Indian",
                "personal_email": "vishaal.personal@gmail.com",
                "gender": "Male",
                "marital_status": "Single",
                "bank_name": "HDFC Bank",
                "account_number": "50100234567890",
                "ifsc_code": "HDFC0001234",
                "pan_no": "ABCDE1234F",
                "uan_no": "100987654321",
            },
            {
                "employee_id": "OISHBA20230002",
                "email": "sharan@dayflow.com",
                "hashed_password": hr_hash,
                "role": RoleEnum.HR,
                "first_name": "Sharan",
                "last_name": "B",
                "company_name": "Odoo India",
                "department": "Sales & Marketing",
                "designation": "Senior Marketing Strategist",
                "manager_name": "Kanagaraj R",
                "location": "Bangalore Office",
                "phone": "+91 98765 43211",
                "basic_salary": 45000.0,
                "about": "Growth-focused marketing lead creating impactful campaigns and product brand awareness.",
                "what_i_love": "Collaborating with creative teams and analyzing growth engagement data.",
                "interests_and_hobbies": "Digital storytelling, traveling, trekking, and music.",
                "skills": "Content Strategy, SEO/SEM, Marketing Automation, User Retention",
                "certifications": "Google Digital Marketing Certified, HubSpot Inbound Marketing",
                "date_of_birth": date(1999, 8, 20),
                "nationality": "Indian",
                "personal_email": "sharan.marketing@gmail.com",
                "gender": "Male",
                "marital_status": "Single",
                "bank_name": "ICICI Bank",
                "account_number": "002301567890",
                "ifsc_code": "ICIC0000023",
                "pan_no": "FGHIJ5678K",
                "uan_no": "100987654322",
            },
            {
                "employee_id": "OISASA20230003",
                "email": "saaral@dayflow.com",
                "hashed_password": emp_hash,
                "role": RoleEnum.EMPLOYEE,
                "first_name": "Saaral",
                "last_name": "S",
                "company_name": "Odoo India",
                "department": "Engineering",
                "designation": "Product UI/UX Designer",
                "manager_name": "Vishaal A K",
                "location": "Chennai Hub",
                "phone": "+91 98765 43212",
                "basic_salary": 48000.0,
                "about": "Creative UI/UX designer specialized in design systems, micro-interactions, and accessibility.",
                "what_i_love": "Transforming complex business logic into delightful, effortless user journeys.",
                "interests_and_hobbies": "Vector illustration, UI prototyping, pottery, and reading.",
                "skills": "Figma, Design Systems, UX Research, Micro-interactions, CSS Architecture",
                "certifications": "Interaction Design Foundation (IxDF) Certified Designer",
                "date_of_birth": date(2000, 11, 3),
                "nationality": "Indian",
                "personal_email": "saaral.design@gmail.com",
                "gender": "Female",
                "marital_status": "Single",
                "bank_name": "State Bank of India",
                "account_number": "30456789012",
                "ifsc_code": "SBIN0004567",
                "pan_no": "LMNOP9012Q",
                "uan_no": "100987654323",
            },
            {
                "employee_id": "OISRKA20230004",
                "email": "sreevanth@dayflow.com",
                "hashed_password": emp_hash,
                "role": RoleEnum.EMPLOYEE,
                "first_name": "Sreevanth",
                "last_name": "K",
                "company_name": "Odoo India",
                "department": "Finance & Operations",
                "designation": "Lead Financial Analyst",
                "manager_name": "Vishaal A K",
                "location": "Bangalore Office",
                "phone": "+91 98765 43213",
                "basic_salary": 52000.0,
                "about": "Data-driven financial analyst specializing in budget forecasting and fiscal compliance.",
                "what_i_love": "Creating robust financial forecasting models and strategic planning.",
                "interests_and_hobbies": "Algorithmic trading, swimming, marathon running, and finance podcasts.",
                "skills": "Financial Modeling, Statutory Auditing, Excel/VBA, PowerBI, Risk Analysis",
                "certifications": "CFA Level 2 Candidate, Chartered Financial Modeling Specialist",
                "date_of_birth": date(1997, 2, 28),
                "nationality": "Indian",
                "personal_email": "sreevanth.finance@gmail.com",
                "gender": "Male",
                "marital_status": "Single",
                "bank_name": "Axis Bank",
                "account_number": "912010045678901",
                "ifsc_code": "UTIB0000123",
                "pan_no": "RSTUV3456W",
                "uan_no": "100987654324",
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
                company_name=u_data.get("company_name", "Odoo India"),
                department=u_data["department"],
                designation=u_data["designation"],
                manager_name=u_data.get("manager_name"),
                location=u_data.get("location", "Bangalore Office"),
                basic_salary=u_data["basic_salary"],
                joining_date=date(2023, 1, 15),
                about=u_data.get("about"),
                what_i_love=u_data.get("what_i_love"),
                interests_and_hobbies=u_data.get("interests_and_hobbies"),
                skills=u_data.get("skills"),
                certifications=u_data.get("certifications"),
                date_of_birth=u_data.get("date_of_birth"),
                nationality=u_data.get("nationality", "Indian"),
                personal_email=u_data.get("personal_email"),
                gender=u_data.get("gender"),
                marital_status=u_data.get("marital_status"),
                bank_name=u_data.get("bank_name"),
                account_number=u_data.get("account_number"),
                ifsc_code=u_data.get("ifsc_code"),
                pan_no=u_data.get("pan_no"),
                uan_no=u_data.get("uan_no"),
            )
            db.add(profile)
            created_users.append(user)

        db.flush()
        admin_user = created_users[0]
        hr_user = created_users[1]
        saaral_user = created_users[2]
        sreevanth_user = created_users[3]

        today = date.today()
        # Seed past 14 days of historical attendance (strictly past days < today)
        for i in range(1, 14):
            att_date = today - timedelta(days=i)
            if att_date.weekday() == 6:  # Skip Sunday
                continue

            for u in created_users:
                check_in = datetime.combine(att_date, datetime.min.time(), tzinfo=timezone.utc).replace(hour=9, minute=0)
                check_out = datetime.combine(att_date, datetime.min.time(), tzinfo=timezone.utc).replace(hour=17, minute=30)
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
