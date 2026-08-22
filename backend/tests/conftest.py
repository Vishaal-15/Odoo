import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.core.database import Base, get_db
from app.core.security import get_password_hash, create_access_token
from app.models.user import User, EmployeeProfile, RoleEnum
from app.core.limiter import limiter
from app.main import app

# In-memory SQLite for isolated, fast testing
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency and rate limiter bypassed for tests."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    limiter.enabled = False
    with TestClient(app) as test_client:
        yield test_client
    limiter.enabled = True
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def employee_user(db_session) -> User:
    user = User(
        employee_id="EMP100",
        email="emp@dayflow.com",
        hashed_password=get_password_hash("Password123!"),
        role=RoleEnum.EMPLOYEE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    profile = EmployeeProfile(
        user_id=user.id,
        first_name="Employee",
        last_name="Test",
        department="Engineering",
        designation="Software Engineer",
        phone="+1234567890",
        joining_date=date(2026, 1, 1),
        basic_salary=75000.0,
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def second_employee_user(db_session) -> User:
    user = User(
        employee_id="EMP101",
        email="emp2@dayflow.com",
        hashed_password=get_password_hash("Password123!"),
        role=RoleEnum.EMPLOYEE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    profile = EmployeeProfile(
        user_id=user.id,
        first_name="Second",
        last_name="Employee",
        department="Marketing",
        designation="Marketing Specialist",
        phone="+1234567891",
        joining_date=date(2026, 2, 1),
        basic_salary=65000.0,
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def hr_user(db_session) -> User:
    user = User(
        employee_id="HR100",
        email="hr@dayflow.com",
        hashed_password=get_password_hash("Password123!"),
        role=RoleEnum.HR,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    profile = EmployeeProfile(
        user_id=user.id,
        first_name="HR",
        last_name="Officer",
        department="Human Resources",
        designation="HR Generalist",
        phone="+1234567899",
        joining_date=date(2025, 1, 1),
        basic_salary=85000.0,
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def admin_user(db_session) -> User:
    user = User(
        employee_id="ADM100",
        email="admin@dayflow.com",
        hashed_password=get_password_hash("Password123!"),
        role=RoleEnum.ADMIN,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    profile = EmployeeProfile(
        user_id=user.id,
        first_name="System",
        last_name="Admin",
        department="IT",
        designation="System Admin",
        phone="+1234567888",
        joining_date=date(2024, 1, 1),
        basic_salary=110000.0,
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def employee_token(employee_user) -> str:
    return create_access_token(
        subject=employee_user.id,
        extra_claims={"email": employee_user.email, "role": employee_user.role.value},
    )


@pytest.fixture(scope="function")
def hr_token(hr_user) -> str:
    return create_access_token(
        subject=hr_user.id,
        extra_claims={"email": hr_user.email, "role": hr_user.role.value},
    )


@pytest.fixture(scope="function")
def admin_token(admin_user) -> str:
    return create_access_token(
        subject=admin_user.id,
        extra_claims={"email": admin_user.email, "role": admin_user.role.value},
    )


@pytest.fixture(scope="function")
def employee_headers(employee_token) -> dict:
    return {"Authorization": f"Bearer {employee_token}"}


@pytest.fixture(scope="function")
def hr_headers(hr_token) -> dict:
    return {"Authorization": f"Bearer {hr_token}"}


@pytest.fixture(scope="function")
def admin_headers(admin_token) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}
