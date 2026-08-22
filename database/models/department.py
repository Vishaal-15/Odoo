from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base


class Department(Base):
    """
    Department entity organizing employees across organizational units.
    """
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    manager_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    manager = relationship(
        "Employee",
        foreign_keys=[manager_id],
        post_update=True
    )
    employees = relationship(
        "Employee",
        back_populates="department",
        foreign_keys="Employee.department_id"
    )

    def __repr__(self) -> str:
        return f"<Department id={self.id} name='{self.name}' code='{self.code}'>"
