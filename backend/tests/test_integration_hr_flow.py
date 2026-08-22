import pytest
from datetime import date, timedelta
from fastapi import status


def test_full_hr_lifecycle(client, hr_headers, employee_user, employee_headers):
    """
    End-to-End Integration Test for HR Manager Persona:
    1. HR Login & Identity verification
    2. Employee Directory access (/employees)
    3. Attendance Overview & Roster (/attendance/summary, /attendance)
    4. Analytics Engine Queries (/analytics/overview, attendance, leave, employees, payroll)
    5. Corporate Reporting Suite (/reports/summary, attendance, leave, employees, payroll)
    6. CSV / Data Export Generation (/reports/export)
    7. Leave Management Review & Approval (/leaves, /leaves/{id}/status)
    8. Monthly Payroll Processing (/payroll)
    9. Verification of Cross-Module Notifications
    """
    # 1. Verify HR profile
    me_resp = client.get("/api/v1/auth/me", headers=hr_headers)
    assert me_resp.status_code == status.HTTP_200_OK
    assert me_resp.json()["role"] == "HR"

    # 2. View All Employees
    emp_list = client.get("/api/v1/employees", headers=hr_headers)
    assert emp_list.status_code == status.HTTP_200_OK
    data = emp_list.json()
    assert data["total"] >= 2  # hr_user and employee_user

    # 3. View Attendance Summary & Detailed Attendance
    att_summary = client.get("/api/v1/attendance/summary", headers=hr_headers)
    assert att_summary.status_code == status.HTTP_200_OK
    assert "total_employees" in att_summary.json()

    # Employee clocks in
    client.post("/api/v1/attendance/check-in", json={"remarks": "Office"}, headers=employee_headers)

    att_list = client.get("/api/v1/attendance", headers=hr_headers)
    assert att_list.status_code == status.HTTP_200_OK
    assert len(att_list.json()["items"]) >= 1

    # 4. Analytics Engine Verification
    overview = client.get("/api/v1/analytics/overview", headers=hr_headers)
    assert overview.status_code == status.HTTP_200_OK
    ov_data = overview.json()
    assert ov_data["total_employees"] >= 2
    assert "workforce" in ov_data
    assert "attendance" in ov_data
    assert "leaveStats" in ov_data
    assert "payrollSummary" in ov_data

    att_analytics = client.get("/api/v1/analytics/attendance", headers=hr_headers)
    assert att_analytics.status_code == status.HTTP_200_OK
    assert att_analytics.json()["attendance_rate"] > 0

    leave_analytics = client.get("/api/v1/analytics/leave", headers=hr_headers)
    assert leave_analytics.status_code == status.HTTP_200_OK

    emp_analytics = client.get("/api/v1/analytics/employees", headers=hr_headers)
    assert emp_analytics.status_code == status.HTTP_200_OK
    assert len(emp_analytics.json()["department_headcounts"]) >= 1

    payroll_analytics = client.get("/api/v1/analytics/payroll", headers=hr_headers)
    assert payroll_analytics.status_code == status.HTTP_200_OK

    # 5. Corporate Reporting Verification
    reports_summary = client.get("/api/v1/reports/summary", headers=hr_headers)
    assert reports_summary.status_code == status.HTTP_200_OK
    assert len(reports_summary.json()) == 4

    att_report = client.get("/api/v1/reports/attendance", headers=hr_headers)
    assert att_report.status_code == status.HTTP_200_OK
    assert len(att_report.json()) >= 1

    # 6. Export Report (CSV format)
    export_resp = client.post(
        "/api/v1/reports/export",
        json={"report_type": "Monthly Attendance", "format": "csv"},
        headers=hr_headers,
    )
    assert export_resp.status_code == status.HTTP_200_OK
    assert "attendance_register" in export_resp.json()["filename"]
    assert export_resp.json()["content"] is not None

    # 7. Employee applies for leave, HR reviews and approves
    l_start = date.today() + timedelta(days=14)
    l_end = date.today() + timedelta(days=16)
    apply_resp = client.post(
        "/api/v1/leaves",
        json={"leave_type": "PAID", "start_date": l_start.isoformat(), "end_date": l_end.isoformat(), "reason": "Conference"},
        headers=employee_headers,
    )
    assert apply_resp.status_code == status.HTTP_201_CREATED
    leave_id = apply_resp.json()["id"]

    # HR lists leaves and approves
    all_leaves = client.get("/api/v1/leaves", headers=hr_headers)
    assert all_leaves.status_code == status.HTTP_200_OK
    assert any(l["id"] == leave_id for l in all_leaves.json()["items"])

    approve_resp = client.patch(
        f"/api/v1/leaves/{leave_id}/status",
        json={"status": "APPROVED", "reviewer_comments": "Approved for conference"},
        headers=hr_headers,
    )
    assert approve_resp.status_code == status.HTTP_200_OK
    assert approve_resp.json()["status"] == "APPROVED"

    # 8. HR processes payroll for employee
    pay_payload = {
        "user_id": employee_user.id,
        "month": 8,
        "year": 2026,
        "basic_salary": 6500.0,
        "allowances": 800.0,
        "deductions": 300.0,
        "payment_status": "PROCESSED",
        "payment_date": "2026-08-31",
        "remarks": "August Compensation",
    }
    pay_resp = client.post("/api/v1/payroll", json=pay_payload, headers=hr_headers)
    assert pay_resp.status_code == status.HTTP_201_CREATED
    assert pay_resp.json()["net_salary"] == 7000.0  # 6500 + 800 - 300

    # 9. Verify Employee receives notifications for leave approval and payroll release
    emp_notifs = client.get("/api/v1/notifications", headers=employee_headers)
    assert emp_notifs.status_code == status.HTTP_200_OK
    items = emp_notifs.json()["items"]
    assert any("APPROVED" in n["title"] or "Approved" in n["title"] for n in items)
    assert any("Payroll" in n["title"] for n in items)
