import pytest
from datetime import date, timedelta
from fastapi import status


def test_full_employee_lifecycle(client):
    """
    End-to-End Integration Test for Employee Persona:
    1. Register new user
    2. Login to obtain access token
    3. Retrieve profile (/auth/me & /employees/me)
    4. Clock in for today (/attendance/check-in)
    5. Attempt duplicate clock-in (fails gracefully)
    6. Clock out for today (/attendance/check-out)
    7. View personal attendance history (/attendance/me)
    8. Apply for time-off / leave (/leaves)
    9. Attempt overlapping leave application (rejected)
    10. View personal leave history (/leaves/me)
    11. View personal payroll slips (/payroll/me)
    12. View notifications received (/notifications)
    """
    # 1. Register
    reg_payload = {
        "employee_id": "EMP2001",
        "email": "lifecycle.emp@dayflow.com",
        "password": "StrongPassword123!",
        "role": "EMPLOYEE",
        "first_name": "Lifecycle",
        "last_name": "Employee",
        "department": "Engineering",
        "designation": "Staff Engineer",
        "phone": "+1999888777",
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == status.HTTP_201_CREATED
    data = reg_resp.json()
    assert data["email"] == "lifecycle.emp@dayflow.com"
    assert data["role"] == "EMPLOYEE"

    # 2. Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "lifecycle.emp@dayflow.com", "password": "StrongPassword123!"},
    )
    assert login_resp.status_code == status.HTTP_200_OK
    token_data = login_resp.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. View profile
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == status.HTTP_200_OK
    assert me_resp.json()["email"] == "lifecycle.emp@dayflow.com"

    profile_resp = client.get("/api/v1/employees/me", headers=headers)
    assert profile_resp.status_code == status.HTTP_200_OK
    assert profile_resp.json()["profile"]["first_name"] == "Lifecycle"

    # 4. Check In
    checkin_resp = client.post("/api/v1/attendance/check-in", json={"remarks": "Starting workday"}, headers=headers)
    assert checkin_resp.status_code == status.HTTP_201_CREATED
    assert checkin_resp.json()["status"] == "PRESENT"

    # 5. Duplicate Check In rejected
    dup_checkin = client.post("/api/v1/attendance/check-in", json={"remarks": "Double tap"}, headers=headers)
    assert dup_checkin.status_code == status.HTTP_400_BAD_REQUEST

    # 6. Check Out
    checkout_resp = client.post("/api/v1/attendance/check-out", json={"remarks": "Day done"}, headers=headers)
    assert checkout_resp.status_code == status.HTTP_200_OK
    assert checkout_resp.json()["check_out_time"] is not None

    # 7. View Personal Attendance History
    att_history = client.get("/api/v1/attendance/me", headers=headers)
    assert att_history.status_code == status.HTTP_200_OK
    assert len(att_history.json()) >= 1

    # 8. Apply for Leave
    leave_start = date.today() + timedelta(days=7)
    leave_end = date.today() + timedelta(days=9)
    leave_payload = {
        "leave_type": "PAID",
        "start_date": leave_start.isoformat(),
        "end_date": leave_end.isoformat(),
        "reason": "Family gathering",
    }
    leave_resp = client.post("/api/v1/leaves", json=leave_payload, headers=headers)
    assert leave_resp.status_code == status.HTTP_201_CREATED
    leave_id = leave_resp.json()["id"]
    assert leave_resp.json()["status"] == "PENDING"
    assert leave_resp.json()["days_count"] == 3.0

    # 9. Overlapping leave rejected
    overlap_resp = client.post("/api/v1/leaves", json=leave_payload, headers=headers)
    assert overlap_resp.status_code == status.HTTP_400_BAD_REQUEST

    # 10. View personal leaves
    leaves_resp = client.get("/api/v1/leaves/me", headers=headers)
    assert leaves_resp.status_code == status.HTTP_200_OK
    assert len(leaves_resp.json()) == 1

    # 11. View personal payroll (empty initially)
    payroll_resp = client.get("/api/v1/payroll/me", headers=headers)
    assert payroll_resp.status_code == status.HTTP_200_OK
    assert isinstance(payroll_resp.json(), list)

    # 12. View notifications
    notif_resp = client.get("/api/v1/notifications", headers=headers)
    assert notif_resp.status_code == status.HTTP_200_OK
    assert "items" in notif_resp.json()
