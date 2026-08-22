"""Database seed script for Dayflow HRMS development and testing"""
from datetime import date
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, EmployeeProfile, RoleEnum


def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping seed.")
            return

        users_data = [
            {
                "employee_id": "ADM001",
                "email": "admin@dayflow.com",
                "password": "AdminPassword123!",
                "role": RoleEnum.ADMIN,
                "first_name": "Senthil",
                "last_name": "Kumar",
                "department": "Administration",
                "designation": "System Administrator",
                "phone": "+91-98765-43210",
                "basic_salary": 120000.0,
            },
            {
                "employee_id": "HR001",
                "email": "hr@dayflow.com",
                "password": "HrPassword123!",
                "role": RoleEnum.HR,
                "first_name": "Kanagaraj",
                "last_name": "R",
                "department": "Human Resources",
                "designation": "HR Manager",
                "phone": "+91-98765-43211",
                "basic_salary": 95000.0,
            },
            {
                "employee_id": "EMP001",
                "email": "vishaal@dayflow.com",
                "password": "EmpPassword123!",
                "role": RoleEnum.EMPLOYEE,
                "first_name": "Vishaal",
                "last_name": "S",
                "department": "Engineering",
                "designation": "Full Stack Developer",
                "phone": "+91-98765-43212",
                "basic_salary": 85000.0,
            },
            {
                "employee_id": "EMP002",
                "email": "saaral@dayflow.com",
                "password": "EmpPassword123!",
                "role": RoleEnum.EMPLOYEE,
                "first_name": "Saaral",
                "last_name": "Varunie",
                "department": "Product",
                "designation": "Product Designer",
                "phone": "+91-98765-43213",
                "basic_salary": 80000.0,
            },
        ]

        for u in users_data:
            user = User(
                employee_id=u["employee_id"],
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                role=u["role"],
                is_active=True,
            )
            db.add(user)
            db.flush()

            profile = EmployeeProfile(
                user_id=user.id,
                first_name=u["first_name"],
                last_name=u["last_name"],
                department=u["department"],
                designation=u["designation"],
                phone=u["phone"],
                joining_date=date.today(),
                basic_salary=u["basic_salary"],
            )
            db.add(profile)

        db.commit()
        print("Successfully seeded initial Dayflow HRMS data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
