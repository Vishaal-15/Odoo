from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, Token
from app.schemas.employee import EmployeeResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new employee/user",
)
def register(
    data: UserRegister,
    db: Session = Depends(get_db),
):
    """
    Register a new user account with employee profile.
    Default role is EMPLOYEE.
    """
    service = AuthService(db)
    return service.register(data)


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain JWT token",
)
def login(
    data: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Authenticate with email and password to receive a JWT access token.
    """
    service = AuthService(db)
    return service.login(data)


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
