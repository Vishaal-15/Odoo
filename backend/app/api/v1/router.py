from fastapi import APIRouter
from app.api.v1.routes import (
    auth,
    employees,
    attendance,
    leaves,
    payroll,
    notifications,
    analytics,
    audit_logs,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(employees.router)
api_router.include_router(attendance.router)
api_router.include_router(leaves.router)
api_router.include_router(payroll.router)
api_router.include_router(notifications.router)
api_router.include_router(analytics.router)
api_router.include_router(audit_logs.router)
