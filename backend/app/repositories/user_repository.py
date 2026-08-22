from typing import Optional, List, Tuple
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models.user import User, EmployeeProfile, RoleEnum
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_id(self, user_id: int) -> Optional[User]:
        return (
            self.db.query(User)
            .options(joinedload(User.profile))
            .filter(User.id == user_id)
            .first()
        )

    def get_by_email(self, email: str) -> Optional[User]:
        return (
            self.db.query(User)
            .options(joinedload(User.profile))
            .filter(User.email == email.lower().strip())
            .first()
        )

    def get_by_employee_id(self, employee_id: str) -> Optional[User]:
        return (
            self.db.query(User)
            .options(joinedload(User.profile))
            .filter(User.employee_id == employee_id.strip())
            .first()
        )

    def get_hr_admin_users(self) -> List[User]:
        return (
            self.db.query(User)
            .filter(User.role.in_([RoleEnum.HR, RoleEnum.ADMIN]), User.is_active == True)
            .all()
        )

    def list_employees(
        self,
        skip: int = 0,
        limit: int = 50,
        department: Optional[str] = None,
        role: Optional[RoleEnum] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Tuple[List[User], int]:
        query = self.db.query(User).join(User.profile).options(joinedload(User.profile))

        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        if role:
            query = query.filter(User.role == role)

        if department:
            query = query.filter(EmployeeProfile.department.ilike(f"%{department}%"))

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    User.employee_id.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    EmployeeProfile.first_name.ilike(search_pattern),
                    EmployeeProfile.last_name.ilike(search_pattern),
                    EmployeeProfile.designation.ilike(search_pattern),
                )
            )

        total = query.count()
        items = query.order_by(User.id.asc()).offset(skip).limit(limit).all()
        return items, total

    def create_user_with_profile(self, user: User, profile: EmployeeProfile) -> User:
        self.db.add(user)
        self.db.flush()
        profile.user_id = user.id
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(user)
        return user
