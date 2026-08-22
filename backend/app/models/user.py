import enum
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    DateTime,
    Date,
    Text,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class RoleEnum(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    HR = "HR"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.EMPLOYEE, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(100), nullable=True, index=True)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    profile = relationship("EmployeeProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
    leaves = relationship(
        "LeaveRequest",
        foreign_keys="LeaveRequest.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reviewed_leaves = relationship(
        "LeaveRequest",
        foreign_keys="LeaveRequest.reviewer_id",
        back_populates="reviewer",
    )
    payrolls = relationship("Payroll", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    company_name = Column(String(100), default="Odoo India", nullable=False)
    department = Column(String(100), nullable=False, default="General", index=True)
    designation = Column(String(100), nullable=False, default="Employee")
    manager_name = Column(String(100), nullable=True)
    location = Column(String(100), default="Headquarters", nullable=True)
    joining_date = Column(Date, nullable=False, default=date.today)
    emergency_contact = Column(String(50), nullable=True)
    basic_salary = Column(Float, nullable=False, default=50000.0)

    # Resume Tab Fields
    about = Column(Text, nullable=True)
    what_i_love = Column(Text, nullable=True)
    interests_and_hobbies = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)

    # Private Info Tab Fields
    date_of_birth = Column(Date, nullable=True)
    nationality = Column(String(50), default="Indian", nullable=True)
    personal_email = Column(String(255), nullable=True)
    gender = Column(String(20), nullable=True)
    marital_status = Column(String(20), nullable=True)
    bank_name = Column(String(100), nullable=True)
    account_number = Column(String(50), nullable=True)
    ifsc_code = Column(String(30), nullable=True)
    pan_no = Column(String(30), nullable=True)
    uan_no = Column(String(30), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="profile")

