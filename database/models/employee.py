from sqlalchemy import Column, Integer, String, Date, Text, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base
from database.models.enums import EmploymentType, EmployeeStatus


class Employee(Base):
    """
    Employee entity representing comprehensive employee profile and job details.
    Matches Dayflow HRMS Section 3.3 (Employee Profile Management).
    """
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True, index=True)
    employee_code = Column(String(50), unique=True, index=True, nullable=False)
    
    # Personal Details
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    profile_picture_url = Column(String(500), nullable=True)

    # Job Details
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    designation = Column(String(100), nullable=False)
    employment_type = Column(
        SQLEnum(EmploymentType, name="employment_type_enum", create_type=False),
        default=EmploymentType.FULL_TIME,
        nullable=False
    )
    joining_date = Column(Date, nullable=False)
    status = Column(
        SQLEnum(EmployeeStatus, name="employee_status_enum", create_type=False),
        default=EmployeeStatus.ACTIVE,
        nullable=False,
        index=True
    )
    
    # Documents / Structured Metadata (Resume, ID Proof, Contract)
    documents = Column(JSON, nullable=True, default=dict)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship(
        "User",
        back_populates="employee",
        foreign_keys=[user_id]
    )
    department = relationship(
        "Department",
        back_populates="employees",
        foreign_keys=[department_id]
    )
    attendance_records = relationship(
        "Attendance",
        back_populates="employee",
        cascade="all, delete-orphan",
        order_by="desc(Attendance.date)"
    )
    leave_requests = relationship(
        "LeaveRequest",
        back_populates="employee",
        cascade="all, delete-orphan",
        order_by="desc(LeaveRequest.created_at)"
    )
    salary_structure = relationship(
        "SalaryStructure",
        back_populates="employee",
        uselist=False,
        cascade="all, delete-orphan"
    )
    payrolls = relationship(
        "Payroll",
        back_populates="employee",
        cascade="all, delete-orphan",
        order_by="desc(Payroll.year), desc(Payroll.month)"
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:
        return f"<Employee id={self.id} code='{self.employee_code}' name='{self.full_name}'>"
