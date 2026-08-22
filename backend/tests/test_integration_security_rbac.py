import pytest
from datetime import date, timedelta
from fastapi import status


def test_unauthenticated_requests_rejected(client):
    """Verify that unauthenticated requests to protected endpoints return 401 Unauthorized."""
    endpoints = [
        ("GET", "/api/v1/auth/me"),
        ("GET", "/api/v1/employees"),
        ("GET", "/api/v1/employees/me"),
        ("POST", "/api/v1/attendance/check-in"),
        ("GET", "/api/v1/attendance/me"),
        ("GET", "/api/v1/leaves/me"),
        ("GET", "/api/v1/payroll/me"),
        ("GET", "/api/v1/notifications"),
        ("GET", "/api/v1/analytics/overview"),
        ("GET", "/api/v1/reports/summary"),
        ("GET", "/api/v1/audit-logs"),
    ]
    for method, path in endpoints:
        if method == "GET":
            resp = client.get(path)
        else:
            resp = client.post(path, json={})
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED, f"Expected 401 for {method} {path}"


def test_employee_rbac_boundaries(client, employee_headers, second_employee_user, hr_user):
    """Verify that regular employees receive 403 Forbidden for HR/Admin endpoints."""
    forbidden_endpoints = [
        ("GET", "/api/v1/employees"),
        ("PATCH", f"/api/v1/employees/{second_employee_user.id}"),
        ("GET", "/api/v1/attendance"),
        ("GET", "/api/v1/attendance/summary"),
        ("GET", "/api/v1/leaves"),
        ("GET", "/api/v1/payroll"),
        ("POST", "/api/v1/payroll"),
        ("GET", "/api/v1/analytics/overview"),
        ("GET", "/api/v1/analytics/attendance"),
        ("GET", "/api/v1/analytics/leave"),
        ("GET", "/api/v1/analytics/employees"),
        ("GET", "/api/v1/analytics/payroll"),
        ("GET", "/api/v1/reports/summary"),
        ("GET", "/api/v1/reports/attendance"),
        ("GET", "/api/v1/reports/leave"),
        ("GET", "/api/v1/reports/employees"),
        ("GET", "/api/v1/reports/payroll"),
        ("POST", "/api/v1/reports/export"),
        ("GET", "/api/v1/audit-logs"),
    ]
    for method, path in forbidden_endpoints:
        if method == "GET":
            resp = client.get(path, headers=employee_headers)
        elif method == "PATCH":
            resp = client.patch(path, json={}, headers=employee_headers)
        else:
            resp = client.post(path, json={}, headers=employee_headers)
        assert resp.status_code == status.HTTP_403_FORBIDDEN, f"Expected 403 for Employee on {method} {path}"


def test_cross_employee_privacy_isolation(client, employee_user, employee_headers, second_employee_user, hr_headers):
    """Verify that employees cannot view or mutate another employee's private profile or payroll."""
    # 1. Employee 1 attempts to access Employee 2's profile
    resp = client.get(f"/api/v1/employees/{second_employee_user.id}", headers=employee_headers)
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # 2. HR creates payroll for Employee 2
    pay_resp = client.post(
        "/api/v1/payroll",
        json={
            "user_id": second_employee_user.id,
            "month": 8,
            "year": 2026,
            "basic_salary": 8000.0,
            "payment_status": "PAID",
        },
        headers=hr_headers,
    )
    assert pay_resp.status_code == status.HTTP_201_CREATED
    payroll_id = pay_resp.json()["id"]

    # 3. Employee 1 attempts to view Employee 2's payroll
    view_pay = client.get(f"/api/v1/payroll/{payroll_id}", headers=employee_headers)
    assert view_pay.status_code == status.HTTP_403_FORBIDDEN

    # 4. Employee 1 attempts to approve/reject leaves
    review_resp = client.patch(
        "/api/v1/leaves/1/status",
        json={"status": "APPROVED"},
        headers=employee_headers,
    )
    assert review_resp.status_code == status.HTTP_403_FORBIDDEN


def test_mathematical_and_data_integrity(client, hr_headers, employee_user, employee_headers, second_employee_user):
    """
    Verify analytics calculations match actual database figures:
    - 2 employees in system (employee_user + second_employee_user + hr_user = 3 total)
    - 1 employee clocks in -> attendance rate should be accurately computed
    """
    # Total employees initially
    overview = client.get("/api/v1/analytics/overview", headers=hr_headers).json()
    total_emp = overview["total_employees"]
    assert total_emp >= 3

    # Employee 1 clocks in
    client.post("/api/v1/attendance/check-in", json={}, headers=employee_headers)

    # Check updated analytics
    overview_after = client.get("/api/v1/analytics/overview", headers=hr_headers).json()
    assert overview_after["present_today"] == 1
    expected_rate = round((1 / total_emp) * 100, 1)
    assert overview_after["attendance"]["averageAttendanceRate"] == expected_rate


def test_edge_case_and_error_handling(client, employee_headers):
    """Verify application handles malformed tokens and invalid business logic gracefully."""
    # 1. Malformed token
    bad_token_headers = {"Authorization": "Bearer not.a.valid.jwt.token"}
    resp = client.get("/api/v1/auth/me", headers=bad_token_headers)
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    # 2. Checkout before checking in
    checkout = client.post("/api/v1/attendance/check-out", json={}, headers=employee_headers)
    # If not checked in today, it returns 400
    # Note: if previously checked in, test client is isolated per function fixture
    assert checkout.status_code == status.HTTP_400_BAD_REQUEST

    # 3. Inverted leave dates (end_date < start_date)
    bad_leave = client.post(
        "/api/v1/leaves",
        json={
            "leave_type": "PAID",
            "start_date": "2026-09-10",
            "end_date": "2026-09-05",
            "reason": "Time travel",
        },
        headers=employee_headers,
    )
    assert bad_leave.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_ENTITY]
