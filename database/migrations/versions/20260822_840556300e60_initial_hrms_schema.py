"""initial_hrms_schema

Revision ID: 840556300e60
Revises: 
Create Date: 2026-08-22 09:58:24.706722

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '840556300e60'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create Enums
    user_role_enum = postgresql.ENUM('ADMIN', 'HR', 'EMPLOYEE', name='user_role_enum', create_type=False)
    user_role_type = postgresql.ENUM('ADMIN', 'HR', 'EMPLOYEE', name='user_role_enum')
    user_role_type.create(op.get_bind(), checkfirst=True)

    employment_type_enum = postgresql.ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', name='employment_type_enum', create_type=False)
    employment_type_type = postgresql.ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', name='employment_type_enum')
    employment_type_type.create(op.get_bind(), checkfirst=True)

    employee_status_enum = postgresql.ENUM('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE', name='employee_status_enum', create_type=False)
    employee_status_type = postgresql.ENUM('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE', name='employee_status_enum')
    employee_status_type.create(op.get_bind(), checkfirst=True)

    attendance_status_enum = postgresql.ENUM('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', name='attendance_status_enum', create_type=False)
    attendance_status_type = postgresql.ENUM('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', name='attendance_status_enum')
    attendance_status_type.create(op.get_bind(), checkfirst=True)

    leave_status_enum = postgresql.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', name='leave_status_enum', create_type=False)
    leave_status_type = postgresql.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', name='leave_status_enum')
    leave_status_type.create(op.get_bind(), checkfirst=True)

    payroll_status_enum = postgresql.ENUM('DRAFT', 'PROCESSED', 'PAID', name='payroll_status_enum', create_type=False)
    payroll_status_type = postgresql.ENUM('DRAFT', 'PROCESSED', 'PAID', name='payroll_status_enum')
    payroll_status_type.create(op.get_bind(), checkfirst=True)

    notification_type_enum = postgresql.ENUM('INFO', 'LEAVE_STATUS', 'ATTENDANCE_ALERT', 'PAYROLL_RELEASE', 'ANNOUNCEMENT', name='notification_type_enum', create_type=False)
    notification_type_type = postgresql.ENUM('INFO', 'LEAVE_STATUS', 'ATTENDANCE_ALERT', 'PAYROLL_RELEASE', 'ANNOUNCEMENT', name='notification_type_enum')
    notification_type_type.create(op.get_bind(), checkfirst=True)

    # 2. Create Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', user_role_enum, nullable=False, server_default='EMPLOYEE'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)

    # 3. Create Departments Table (without manager FK initially to break cycle)
    op.create_table(
        'departments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('manager_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_departments_code'), 'departments', ['code'], unique=True)
    op.create_index(op.f('ix_departments_id'), 'departments', ['id'], unique=False)

    # 4. Create Employees Table
    op.create_table(
        'employees',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('employee_code', sa.String(length=50), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=30), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('profile_picture_url', sa.String(length=500), nullable=True),
        sa.Column('department_id', sa.Integer(), nullable=True),
        sa.Column('designation', sa.String(length=100), nullable=False),
        sa.Column('employment_type', employment_type_enum, nullable=False, server_default='FULL_TIME'),
        sa.Column('joining_date', sa.Date(), nullable=False),
        sa.Column('status', employee_status_enum, nullable=False, server_default='ACTIVE'),
        sa.Column('documents', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_employees_department_id'), 'employees', ['department_id'], unique=False)
    op.create_index(op.f('ix_employees_email'), 'employees', ['email'], unique=True)
    op.create_index(op.f('ix_employees_employee_code'), 'employees', ['employee_code'], unique=True)
    op.create_index(op.f('ix_employees_id'), 'employees', ['id'], unique=False)
    op.create_index(op.f('ix_employees_status'), 'employees', ['status'], unique=False)
    op.create_index(op.f('ix_employees_user_id'), 'employees', ['user_id'], unique=True)

    # 5. Add manager_id foreign key constraint to departments
    op.create_foreign_key(
        'fk_departments_manager_id_employees',
        'departments', 'employees',
        ['manager_id'], ['id'],
        ondelete='SET NULL'
    )

    # 6. Create Leave Types Table
    op.create_table(
        'leave_types',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=False),
        sa.Column('days_allowed_per_year', sa.Integer(), nullable=False, server_default='12'),
        sa.Column('is_paid', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_leave_types_code'), 'leave_types', ['code'], unique=True)
    op.create_index(op.f('ix_leave_types_id'), 'leave_types', ['id'], unique=False)

    # 7. Create Attendance Table
    op.create_table(
        'attendance',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('check_in', sa.DateTime(timezone=True), nullable=True),
        sa.Column('check_out', sa.DateTime(timezone=True), nullable=True),
        sa.Column('work_hours', sa.Numeric(precision=5, scale=2), nullable=True, server_default='0.00'),
        sa.Column('status', attendance_status_enum, nullable=False, server_default='PRESENT'),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('employee_id', 'date', name='uq_attendance_employee_date')
    )
    op.create_index(op.f('ix_attendance_date'), 'attendance', ['date'], unique=False)
    op.create_index('ix_attendance_employee_date', 'attendance', ['employee_id', 'date'], unique=False)
    op.create_index(op.f('ix_attendance_employee_id'), 'attendance', ['employee_id'], unique=False)
    op.create_index(op.f('ix_attendance_id'), 'attendance', ['id'], unique=False)
    op.create_index(op.f('ix_attendance_status'), 'attendance', ['status'], unique=False)

    # 8. Create Leave Requests Table
    op.create_table(
        'leave_requests',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('leave_type_id', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('days_count', sa.Numeric(precision=4, scale=1), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', leave_status_enum, nullable=False, server_default='PENDING'),
        sa.Column('reviewed_by', sa.Integer(), nullable=True),
        sa.Column('review_comments', sa.Text(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['leave_type_id'], ['leave_types.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_leave_requests_dates', 'leave_requests', ['start_date', 'end_date'], unique=False)
    op.create_index(op.f('ix_leave_requests_employee_id'), 'leave_requests', ['employee_id'], unique=False)
    op.create_index('ix_leave_requests_employee_status', 'leave_requests', ['employee_id', 'status'], unique=False)
    op.create_index(op.f('ix_leave_requests_id'), 'leave_requests', ['id'], unique=False)
    op.create_index(op.f('ix_leave_requests_leave_type_id'), 'leave_requests', ['leave_type_id'], unique=False)
    op.create_index(op.f('ix_leave_requests_status'), 'leave_requests', ['status'], unique=False)

    # 9. Create Salary Structures Table
    op.create_table(
        'salary_structures',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('base_salary', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('allowances', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('allowances_breakdown', sa.JSON(), nullable=True),
        sa.Column('deductions', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('deductions_breakdown', sa.JSON(), nullable=True),
        sa.Column('net_salary', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('effective_from', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_salary_structures_employee_id'), 'salary_structures', ['employee_id'], unique=True)
    op.create_index(op.f('ix_salary_structures_id'), 'salary_structures', ['id'], unique=False)

    # 10. Create Payrolls Table
    op.create_table(
        'payrolls',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('month', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('base_salary', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('allowances', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('deductions', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('net_salary', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('payment_status', payroll_status_enum, nullable=False, server_default='DRAFT'),
        sa.Column('payment_date', sa.Date(), nullable=True),
        sa.Column('payslip_url', sa.String(length=500), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('employee_id', 'month', 'year', name='uq_payroll_employee_month_year')
    )
    op.create_index('ix_payroll_employee_status', 'payrolls', ['employee_id', 'payment_status'], unique=False)
    op.create_index('ix_payroll_period', 'payrolls', ['year', 'month'], unique=False)
    op.create_index(op.f('ix_payrolls_employee_id'), 'payrolls', ['employee_id'], unique=False)
    op.create_index(op.f('ix_payrolls_id'), 'payrolls', ['id'], unique=False)
    op.create_index(op.f('ix_payrolls_payment_status'), 'payrolls', ['payment_status'], unique=False)

    # 11. Create Notifications Table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', notification_type_enum, nullable=False, server_default='INFO'),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('link', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_created_at'), 'notifications', ['created_at'], unique=False)
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_is_read'), 'notifications', ['is_read'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)
    op.create_index('ix_notifications_user_unread', 'notifications', ['user_id', 'is_read'], unique=False)

    # 12. Create Audit Logs Table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_name', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.String(length=100), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
    op.create_index('ix_audit_logs_action_created', 'audit_logs', ['action', 'created_at'], unique=False)
    op.create_index(op.f('ix_audit_logs_created_at'), 'audit_logs', ['created_at'], unique=False)
    op.create_index('ix_audit_logs_entity', 'audit_logs', ['entity_name', 'entity_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_entity_name'), 'audit_logs', ['entity_name'], unique=False)
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_audit_logs_user_id'), 'audit_logs', ['user_id'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse dependency order
    op.drop_table('audit_logs')
    op.drop_table('notifications')
    op.drop_table('payrolls')
    op.drop_table('salary_structures')
    op.drop_table('leave_requests')
    op.drop_table('attendance')
    op.drop_table('leave_types')
    
    op.drop_constraint('fk_departments_manager_id_employees', 'departments', type_='foreignkey')
    op.drop_table('employees')
    op.drop_table('departments')
    op.drop_table('users')

    # Drop enums
    op.execute("DROP TYPE IF EXISTS notification_type_enum CASCADE;")
    op.execute("DROP TYPE IF EXISTS payroll_status_enum CASCADE;")
    op.execute("DROP TYPE IF EXISTS leave_status_enum CASCADE;")
    op.execute("DROP TYPE IF EXISTS attendance_status_enum CASCADE;")
    op.execute("DROP TYPE IF EXISTS employee_status_enum CASCADE;")
    op.execute("DROP TYPE IF EXISTS employment_type_enum CASCADE;")
    op.execute("DROP TYPE IF EXISTS user_role_enum CASCADE;")
