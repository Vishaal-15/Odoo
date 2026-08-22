from typing import Optional
from fastapi import APIRouter, Depends, Request, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.api.deps import get_current_user, get_optional_current_user
from app.models.user import User
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    RefreshTokenRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    LogoutRequest,
)
from app.schemas.employee import EmployeeResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])


@router.post(
    "/register",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new employee with strong password validation",
)
@limiter.limit(settings.RATE_LIMIT_REGISTER)
def register(
    request: Request,
    data: UserRegister,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Register a new user account with employee profile.
    Enforces password complexity and issues an email verification token.
    Protected with rate-limiting to prevent automated registration abuse.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    service = AuthService(db)
    user = service.register(data, ip_address=client_ip, user_agent=user_agent)

    # Coordinated background task placeholder for Developer 4 / Email Worker
    # background_tasks.add_task(send_verification_email, user.email, user.verification_token)

    return user


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user, issue JWT access token and rotating refresh token",
)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
def login(
    request: Request,
    data: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Authenticate with email and password to receive a short-lived access token
    and rotating refresh token. Protected against brute-force / credential stuffing.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    service = AuthService(db)
    return service.login(data, ip_address=client_ip, user_agent=user_agent)


@router.post(
    "/refresh",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Rotate refresh token and issue new access token",
)
def refresh_token(
    request: Request,
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """
    Exchanges an active refresh token for a newly rotated refresh token and fresh access token.
    Invalidates the previous refresh token to prevent replay attacks.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    service = AuthService(db)
    result = service.refresh(data.refresh_token, ip_address=client_ip, user_agent=user_agent)
    # Include minimal user dict matching Token schema
    result["user"] = {}
    return result


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Revoke active refresh token / session logout",
)
def logout(
    request: Request,
    data: LogoutRequest = LogoutRequest(),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Immediately revoke session tokens for authenticated user.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    service = AuthService(db)
    service.logout(
        raw_refresh_token=data.refresh_token,
        user_id=current_user.id if current_user else None,
        ip_address=client_ip,
        user_agent=user_agent,
    )
    return {"message": "Successfully logged out. Session revoked."}


@router.post(
    "/verify-email",
    status_code=status.HTTP_200_OK,
    summary="Verify user email address using token",
)
def verify_email(
    data: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    """
    Validates the email verification token and marks user as verified.
    """
    service = AuthService(db)
    service.verify_email(data.token)
    return {"message": "Email address successfully verified."}


@router.post(
    "/resend-verification",
    status_code=status.HTTP_200_OK,
    summary="Resend email verification token",
)
def resend_verification(
    data: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Generates a new verification token and triggers email dispatch.
    """
    service = AuthService(db)
    token = service.resend_verification(data.email)
    # Coordinated background task placeholder for Developer 4
    # background_tasks.add_task(send_verification_email, data.email, token)
    return {"message": "Verification email sent.", "verification_token": token}


@router.get(
    "/me",
    response_model=EmployeeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve profile and account details of the currently logged-in user.
    """
    return current_user
