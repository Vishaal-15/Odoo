import pytest
from datetime import date, timedelta
from fastapi import status


def test_reports_summary_endpoint(client, hr_headers):
    """Test fetching standard corporate reports summary metadata."""
    resp = client.get("/api/v1/reports/summary", headers=hr_headers)
    assert resp.status_code == status.HTTP_200_OK
    items = resp.json()
    assert isinstance(items, list)
    assert len(items) == 4
    categories = [item["category"] for item in items]
    assert "Attendance" in categories
    assert "Payroll" in categories
    assert "Leave" in categories
    assert "Headcount" in categories


def test_attendance_report_filtering(client, hr_headers, employee_headers, employee_user):
    """Test attendance report generation with various query filters."""
    # Clock in for employee
    client.post("/api/v1/attendance/check-in", json={"remarks": "Office"}, headers=employee_headers)

    # 1. Unfiltered report
    resp = client.get("/api/v1/reports/attendance", headers=hr_headers)
    assert resp.status_code == status.HTTP_200_OK
    records = resp.json()
    assert len(records) >= 1
    assert records[0]["employee_id"] == employee_user.employee_id
    assert records[0]["department"] == "Engineering"

    # 2. Filter by matching department
    dept_resp = client.get("/api/v1/reports/attendance?department=Engineering", headers=hr_headers)
    assert dept_resp.status_code == status.HTTP_200_OK
    assert len(dept_resp.json()) >= 1

    # 3. Filter by non-matching department
    no_match_resp = client.get("/api/v1/reports/attendance?department=Finance", headers=hr_headers)
    assert no_match_resp.status_code == status.HTTP_200_OK
    assert len(no_match_resp.json()) == 0

    # 4. Filter by employee_id
    emp_resp = client.get(f"/api/v1/reports/attendance?employee_id={employee_user.employee_id}", headers=hr_headers)
    assert emp_resp.status_code == status.HTTP_200_OK
    assert len(emp_resp.json()) >= 1


def test_leave_report_filtering(client, hr_headers, employee_headers):
    """Test leave report generation with type and date filters."""
    # Apply for leave
    s_date = date.today() + timedelta(days=5)
    e_date = date.today() + timedelta(days=7)
    client.post(
        "/api/v1/leaves",
        json={"leave_type": "SICK", "start_date": s_date.isoformat(), "end_date": e_date.isoformat(), "reason": "Fever"},
        headers=employee_headers,
    )

    # 1. Filter by leave_type
    sick_resp = client.get("/api/v1/reports/leave?leave_type=SICK", headers=hr_headers)
    assert sick_resp.status_code == status.HTTP_200_OK
    assert len(sick_resp.json()) >= 1
    assert sick_resp.json()[0]["leave_type"] == "SICK"

    # 2. Filter by status
    pending_resp = client.get("/api/v1/reports/leave?status=PENDING", headers=hr_headers)
    assert pending_resp.status_code == status.HTTP_200_OK
    assert len(pending_resp.json()) >= 1


def test_employee_roster_report(client, hr_headers):
    """Test employee roster report with role and department filters."""
    # All employees
    resp = client.get("/api/v1/reports/employees", headers=hr_headers)
    assert resp.status_code == status.HTTP_200_OK
    records = resp.json()
    assert len(records) >= 1

    # Filter by role
    hr_only = client.get("/api/v1/reports/employees?role=HR", headers=hr_headers)
    assert hr_only.status_code == status.HTTP_200_OK
    assert all(r["role"] == "HR" for r in hr_only.json())


def test_payroll_report_filtering(client, hr_headers, employee_user):
    """Test payroll report generation with month/year filters."""
    # Create payroll record
    client.post(
        "/api/v1/payroll",
        json={
            "user_id": employee_user.id,
            "month": 7,
            "year": 2026,
            "basic_salary": 5000.0,
            "payment_status": "PAID",
        },
        headers=hr_headers,
    )

    # Filter by month and year
    resp = client.get("/api/v1/reports/payroll?month=7&year=2026", headers=hr_headers)
    assert resp.status_code == status.HTTP_200_OK
    records = resp.json()
    assert len(records) == 1
    assert records[0]["month"] == 7
    assert records[0]["year"] == 2026
    assert records[0]["net_salary"] == 5000.0


def test_report_export_csv(client, hr_headers, employee_headers):
    """Test exporting reports in CSV format."""
    # Export attendance
    export_payload = {
        "report_type": "Monthly Attendance",
        "format": "csv",
    }
    resp = client.post("/api/v1/reports/export", json=export_payload, headers=hr_headers)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data["format"] == "csv"
    assert "attendance_register" in data["filename"]
    assert "Employee ID" in data["content"]

    # Export payroll
    pay_export = client.post(
        "/api/v1/reports/export",
        json={"report_type": "Payroll Statement", "format": "csv"},
        headers=hr_headers,
    )
    assert pay_export.status_code == status.HTTP_200_OK
    assert "payroll_statement" in pay_export.json()["filename"]

    # Export leave
    leave_export = client.post(
        "/api/v1/reports/export",
        json={"report_type": "Leave Audit", "format": "csv"},
        headers=hr_headers,
    )
    assert leave_export.status_code == status.HTTP_200_OK
    assert "leave_audit" in leave_export.json()["filename"]


def test_employee_cannot_access_reports(client, employee_headers):
    """Verify regular employee cannot access any reporting endpoint."""
    endpoints = [
        "/api/v1/reports/summary",
        "/api/v1/reports/attendance",
        "/api/v1/reports/leave",
        "/api/v1/reports/employees",
        "/api/v1/reports/payroll",
    ]
    for ep in endpoints:
        resp = client.get(ep, headers=employee_headers)
        assert resp.status_code == status.HTTP_403_FORBIDDEN
