from datetime import datetime, date, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_secure_token,
    hash_token,
    validate_password_strength,
)
from app.models.user import User, EmployeeProfile, RoleEnum
from app.models.notification import NotificationType
from app.repositories.user_repository import UserRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.token_repository import TokenRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.auth import UserRegister, UserLogin


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.notif_repo = NotificationRepository(db)
        self.token_repo = TokenRepository(db)
        self.audit_repo = AuditRepository(db)

    def register(
        self,
        data: UserRegister,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> User:
        # Enforce strong password policy
        validate_password_strength(data.password)

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

        # Create verification token
        verification_token = generate_secure_token()
        hashed_password = get_password_hash(data.password)

        new_user = User(
            employee_id=data.employee_id.strip(),
            email=data.email.lower().strip(),
            hashed_password=hashed_password,
            role=data.role or RoleEnum.EMPLOYEE,
            is_active=True,
            is_verified=False,
            verification_token=verification_token,
        )

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

        # Send welcome & verification notification
        self.notif_repo.create_notification(
            user_id=user.id,
            title="Welcome to Dayflow HRMS!",
            message="Your account has been created. Please verify your email address to complete onboarding.",
            notif_type=NotificationType.GENERAL,
        )

        # Audit log
        self.audit_repo.create_log(
            actor_id=user.id,
            action="USER_REGISTER",
            resource_type="USER",
            resource_id=str(user.id),
            details=f"User {user.email} registered with role {user.role.value}",
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return user

    def login(
        self,
        data: UserLogin,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> dict:
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            self.audit_repo.create_log(
                actor_id=user.id if user else None,
                action="LOGIN_FAILED",
                resource_type="USER",
                resource_id=str(user.id) if user else data.email,
                details="Failed authentication attempt: invalid credentials",
                ip_address=ip_address,
                user_agent=user_agent,
            )
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

        # Issue Access Token
        access_token = create_access_token(
            subject=user.id,
            extra_claims={"email": user.email, "role": user.role.value},
        )

        # Issue & Hash Rotating Refresh Token
        raw_refresh_token = generate_secure_token()
        hashed_refresh = hash_token(raw_refresh_token)
        refresh_expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        self.token_repo.create_token(
            user_id=user.id,
            token_hash=hashed_refresh,
            expires_at=refresh_expires,
        )

        # Audit log successful login
        self.audit_repo.create_log(
            actor_id=user.id,
            action="USER_LOGIN",
            resource_type="USER",
            resource_id=str(user.id),
            details="User logged in successfully",
            ip_address=ip_address,
            user_agent=user_agent,
        )

        first_name = user.profile.first_name if user.profile else ""
        last_name = user.profile.last_name if user.profile else ""
        department = user.profile.department if user.profile else ""
        designation = user.profile.designation if user.profile else ""

        return {
            "access_token": access_token,
            "refresh_token": raw_refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "employee_id": user.employee_id,
                "email": user.email,
                "role": user.role.value,
                "is_verified": user.is_verified,
                "first_name": first_name,
                "last_name": last_name,
                "department": department,
                "designation": designation,
            },
        }

    def refresh(
        self,
        raw_refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> dict:
        """Validate current refresh token, invalidate it, and issue rotated tokens."""
        hashed_current = hash_token(raw_refresh_token)
        stored_token = self.token_repo.get_active_token(hashed_current)

        if not stored_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )

        user = self.user_repo.get_by_id(stored_token.user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or not found.",
            )

        # Invalidate old refresh token (Token Rotation)
        self.token_repo.revoke_token(hashed_current)

        # Create new tokens
        new_access_token = create_access_token(
            subject=user.id,
            extra_claims={"email": user.email, "role": user.role.value},
        )
        new_raw_refresh = generate_secure_token()
        new_hashed_refresh = hash_token(new_raw_refresh)
        new_expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        self.token_repo.create_token(
            user_id=user.id,
            token_hash=new_hashed_refresh,
            expires_at=new_expires,
        )

        self.audit_repo.create_log(
            actor_id=user.id,
            action="TOKEN_ROTATED",
            resource_type="REFRESH_TOKEN",
            resource_id=str(user.id),
            details="Refreshed session with token rotation",
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return {
            "access_token": new_access_token,
            "refresh_token": new_raw_refresh,
            "token_type": "bearer",
        }

    def logout(
        self,
        raw_refresh_token: Optional[str] = None,
        user_id: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> bool:
        if raw_refresh_token:
            hashed = hash_token(raw_refresh_token)
            self.token_repo.revoke_token(hashed)
        elif user_id:
            self.token_repo.revoke_all_user_tokens(user_id)

        if user_id:
            self.audit_repo.create_log(
                actor_id=user_id,
                action="USER_LOGOUT",
                resource_type="USER",
                resource_id=str(user_id),
                details="Session terminated and refresh token revoked",
                ip_address=ip_address,
                user_agent=user_agent,
            )
        return True

    def verify_email(self, token: str) -> bool:
        user = self.user_repo.get_by_verification_token(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token.",
            )

        user.is_verified = True
        user.verification_token = None
        self.db.commit()

        self.audit_repo.create_log(
            actor_id=user.id,
            action="EMAIL_VERIFIED",
            resource_type="USER",
            resource_id=str(user.id),
            details="Email address verified successfully",
        )
        return True

    def resend_verification(self, email: str) -> str:
        user = self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found with this email.",
            )

        if user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account email is already verified.",
            )

        new_token = generate_secure_token()
        user.verification_token = new_token
        self.db.commit()
        return new_token
