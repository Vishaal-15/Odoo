from fastapi import status


def test_hr_create_payroll(client, hr_headers, employee_user):
    payload = {
        "user_id": employee_user.id,
        "month": 8,
        "year": 2026,
        "basic_salary": 8000.0,
        "allowances": 1500.0,
        "deductions": 500.0,
        "payment_status": "PROCESSED",
        "payment_date": "2026-08-31",
        "remarks": "August 2026 Salary Slip",
    }
    response = client.post("/api/v1/payroll", json=payload, headers=hr_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["net_salary"] == 9000.0  # 8000 + 1500 - 500
    assert data["payment_status"] == "PROCESSED"


def test_duplicate_payroll_rejected(client, hr_headers, employee_user):
    payload = {
        "user_id": employee_user.id,
        "month": 7,
        "year": 2026,
        "basic_salary": 8000.0,
    }
    client.post("/api/v1/payroll", json=payload, headers=hr_headers)

    # Second attempt
    response = client.post("/api/v1/payroll", json=payload, headers=hr_headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"].lower()


def test_employee_cannot_create_payroll(client, employee_headers, employee_user):
    payload = {
        "user_id": employee_user.id,
        "month": 9,
        "year": 2026,
        "basic_salary": 10000.0,
    }
    response = client.post("/api/v1/payroll", json=payload, headers=employee_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_employee_can_view_own_payroll(client, hr_headers, employee_headers, employee_user):
    # HR creates slip
    client.post(
        "/api/v1/payroll",
        json={
            "user_id": employee_user.id,
            "month": 6,
            "year": 2026,
            "basic_salary": 8000.0,
        },
        headers=hr_headers,
    )

    # Employee views my payroll
    response = client.get("/api/v1/payroll/me", headers=employee_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["user_id"] == employee_user.id


def test_employee_cannot_view_other_payroll_details(
    client, hr_headers, employee_headers, second_employee_user
):
    # HR creates slip for second employee
    res = client.post(
        "/api/v1/payroll",
        json={
            "user_id": second_employee_user.id,
            "month": 6,
            "year": 2026,
            "basic_salary": 7000.0,
        },
        headers=hr_headers,
    )
    payroll_id = res.json()["id"]

    # First employee attempts to view it
    response = client.get(f"/api/v1/payroll/{payroll_id}", headers=employee_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN
