from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User, EmployeeProfile, RoleEnum
from app.models.notification import NotificationType
from app.repositories.user_repository import UserRepository
from app.repositories.notification_repository import NotificationRepository
from app.schemas.auth import UserRegister, UserLogin


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.notif_repo = NotificationRepository(db)

    def register(self, data: UserRegister) -> User:
        # Check duplicate email
        existing_email = self.user_repo.get_by_email(data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists.",
            )

        # Check duplicate employee_id
        existing_emp_id = self.user_repo.get_by_employee_id(data.employee_id)
        if existing_emp_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this Employee ID already exists.",
            )

        # Create user
        hashed_password = get_password_hash(data.password)
        new_user = User(
            employee_id=data.employee_id.strip(),
            email=data.email.lower().strip(),
            hashed_password=hashed_password,
            role=data.role or RoleEnum.EMPLOYEE,
            is_active=True,
        )

        # Create profile
        profile = EmployeeProfile(
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
            phone=data.phone,
            department=data.department or "General",
            designation=data.designation or "Employee",
            joining_date=data.joining_date or date.today(),
            basic_salary=0.0,
        )

        user = self.user_repo.create_user_with_profile(new_user, profile)

        # Send welcome notification
        self.notif_repo.create_notification(
            user_id=user.id,
            title="Welcome to Dayflow HRMS!",
            message="Your account has been successfully created. Explore your profile, attendance, and leaves.",
            notif_type=NotificationType.GENERAL,
        )

        return user

    def login(self, data: UserLogin) -> dict:
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account is currently deactivated. Please contact HR/Admin.",
            )

        # Build token
        token_payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        }
        token = create_access_token(
            subject=user.id,
            extra_claims={"email": user.email, "role": user.role.value},
        )

        first_name = user.profile.first_name if user.profile else ""
        last_name = user.profile.last_name if user.profile else ""
        department = user.profile.department if user.profile else ""
        designation = user.profile.designation if user.profile else ""

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "employee_id": user.employee_id,
                "email": user.email,
                "role": user.role.value,
                "first_name": first_name,
                "last_name": last_name,
                "department": department,
                "designation": designation,
            },
        }
