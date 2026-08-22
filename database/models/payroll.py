from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey, Enum as SQLEnum, UniqueConstraint, Index, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base
from database.models.enums import PayrollStatus


class SalaryStructure(Base):
    """
    Salary Structure entity defining compensation formula and breakdown for an employee.
    Matches Dayflow HRMS Section 3.3.1 (Salary Structure) and 3.6.2 (Admin Payroll Control).
    """
    __tablename__ = "salary_structures"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    base_salary = Column(Numeric(12, 2), nullable=False)
    allowances = Column(Numeric(12, 2), default=0.00, nullable=False)
    allowances_breakdown = Column(JSON, nullable=True, default=dict)  # e.g. {"hra": 15000, "transport": 5000, "medical": 3000}
    
    deductions = Column(Numeric(12, 2), default=0.00, nullable=False)
    deductions_breakdown = Column(JSON, nullable=True, default=dict)  # e.g. {"tax": 8000, "pf": 4000, "insurance": 1500}
    
    net_salary = Column(Numeric(12, 2), nullable=False)
    effective_from = Column(Date, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    employee = relationship(
        "Employee",
        back_populates="salary_structure"
    )

    def __repr__(self) -> str:
        return f"<SalaryStructure employee_id={self.employee_id} base={self.base_salary} net={self.net_salary}>"


class Payroll(Base):
    """
    Payroll record representing processed monthly salary slips.
    Matches Dayflow HRMS Section 3.6 (Payroll/Salary Management).
    """
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    
    month = Column(Integer, nullable=False)  # 1 - 12
    year = Column(Integer, nullable=False)   # e.g. 2026
    
    base_salary = Column(Numeric(12, 2), nullable=False)
    allowances = Column(Numeric(12, 2), default=0.00, nullable=False)
    deductions = Column(Numeric(12, 2), default=0.00, nullable=False)
    net_salary = Column(Numeric(12, 2), nullable=False)
    
    payment_status = Column(
        SQLEnum(PayrollStatus, name="payroll_status_enum", create_type=False),
        default=PayrollStatus.DRAFT,
        nullable=False,
        index=True
    )
    payment_date = Column(Date, nullable=True)
    payslip_url = Column(String(500), nullable=True)
    remarks = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    employee = relationship(
        "Employee",
        back_populates="payrolls"
    )

    __table_args__ = (
        UniqueConstraint("employee_id", "month", "year", name="uq_payroll_employee_month_year"),
        Index("ix_payroll_period", "year", "month"),
        Index("ix_payroll_employee_status", "employee_id", "payment_status"),
    )

    def __repr__(self) -> str:
        return f"<Payroll id={self.id} employee_id={self.employee_id} period={self.year}-{self.month:02d} net={self.net_salary} status='{self.payment_status}'>"
