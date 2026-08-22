import json
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User, EmployeeProfile, RoleEnum
from app.repositories.user_repository import UserRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.employee import EmployeeProfileUpdateSelf, EmployeeUpdateAdmin


class EmployeeService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.audit_repo = AuditRepository(db)

    def get_employee(self, user_id: int, current_user: User) -> User:
        # Check permissions: Employee can only view own profile
        if current_user.role == RoleEnum.EMPLOYEE and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only view your own profile.",
            )

        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {user_id} not found.",
            )
        return user

    def update_self_profile(self, user_id: int, data: EmployeeProfileUpdateSelf) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee profile not found.",
            )

        profile = user.profile
        if data.phone is not None:
            profile.phone = data.phone
        if data.address is not None:
            profile.address = data.address
        if data.profile_picture_url is not None:
            profile.profile_picture_url = data.profile_picture_url
        if data.emergency_contact is not None:
            profile.emergency_contact = data.emergency_contact

        self.db.commit()
        self.db.refresh(user)

        self.audit_repo.create_log(
            actor_id=user_id,
            action="UPDATE_SELF_PROFILE",
            resource_type="EMPLOYEE_PROFILE",
            resource_id=str(user_id),
            details="Employee updated personal profile fields",
        )

        return user

    def update_employee_by_admin(
        self,
        user_id: int,
        data: EmployeeUpdateAdmin,
        actor: Optional[User] = None,
    ) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {user_id} not found.",
            )

        changes = {}

        # Update User fields
        if data.email is not None and data.email != user.email:
            existing = self.user_repo.get_by_email(data.email)
            if existing and existing.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use by another account.",
                )
            changes["email"] = {"old": user.email, "new": data.email}
            user.email = data.email.lower().strip()

        if data.role is not None and data.role != user.role:
            changes["role"] = {"old": user.role.value, "new": data.role.value}
            user.role = data.role

        if data.is_active is not None and data.is_active != user.is_active:
            changes["is_active"] = {"old": user.is_active, "new": data.is_active}
            user.is_active = data.is_active

        # Update Profile fields
        profile = user.profile
        if data.first_name is not None:
            profile.first_name = data.first_name.strip()
        if data.last_name is not None:
            profile.last_name = data.last_name.strip()
        if data.phone is not None:
            profile.phone = data.phone
        if data.address is not None:
            profile.address = data.address
        if data.profile_picture_url is not None:
            profile.profile_picture_url = data.profile_picture_url
        if data.department is not None:
            changes["department"] = {"old": profile.department, "new": data.department}
            profile.department = data.department.strip()
        if data.designation is not None:
            changes["designation"] = {"old": profile.designation, "new": data.designation}
            profile.designation = data.designation.strip()
        if data.joining_date is not None:
            profile.joining_date = data.joining_date
        if data.emergency_contact is not None:
            profile.emergency_contact = data.emergency_contact
        if data.basic_salary is not None and data.basic_salary != profile.basic_salary:
            changes["basic_salary"] = {"old": profile.basic_salary, "new": data.basic_salary}
            profile.basic_salary = data.basic_salary

        self.db.commit()
        self.db.refresh(user)

        # Audit log critical changes
        if changes and actor:
            self.audit_repo.create_log(
                actor_id=actor.id,
                action="ADMIN_UPDATE_EMPLOYEE",
                resource_type="EMPLOYEE",
                resource_id=str(user_id),
                details=json.dumps(changes),
            )

        return user

    def soft_delete_employee(self, user_id: int, actor: User) -> bool:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {user_id} not found.",
            )

        self.user_repo.soft_delete(user_id)
        self.audit_repo.create_log(
            actor_id=actor.id,
            action="SOFT_DELETE_EMPLOYEE",
            resource_type="USER",
            resource_id=str(user_id),
            details=f"Employee {user.email} (EMP ID: {user.employee_id}) soft deleted",
        )
        return True

    def list_employees(
        self,
        skip: int = 0,
        limit: int = 50,
        department: Optional[str] = None,
        role: Optional[RoleEnum] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Tuple[List[User], int]:
        return self.user_repo.list_employees(
            skip=skip,
            limit=limit,
            department=department,
            role=role,
            search=search,
            is_active=is_active,
        )
