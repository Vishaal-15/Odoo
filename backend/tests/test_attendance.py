from fastapi import status


def test_check_in_success(client, employee_headers):
    payload = {"remarks": "Morning shift start"}
    response = client.post("/api/v1/attendance/check-in", json=payload, headers=employee_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["check_in_time"] is not None
    assert data["check_out_time"] is None
    assert data["status"] == "PRESENT"
    assert data["remarks"] == "Morning shift start"


def test_duplicate_check_in_prevention(client, employee_headers):
    # First check-in
    client.post("/api/v1/attendance/check-in", json={}, headers=employee_headers)

    # Second duplicate check-in
    response = client.post("/api/v1/attendance/check-in", json={}, headers=employee_headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already checked in" in response.json()["detail"].lower()


def test_check_out_without_check_in(client, employee_headers):
    response = client.post("/api/v1/attendance/check-out", json={}, headers=employee_headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "without checking in first" in response.json()["detail"].lower()


def test_check_out_success(client, employee_headers):
    # Check in first
    client.post("/api/v1/attendance/check-in", json={}, headers=employee_headers)

    # Check out
    response = client.post(
        "/api/v1/attendance/check-out",
        json={"remarks": "Day completed"},
        headers=employee_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["check_out_time"] is not None
    assert data["total_hours"] >= 0.0


def test_duplicate_check_out_prevention(client, employee_headers):
    client.post("/api/v1/attendance/check-in", json={}, headers=employee_headers)
    client.post("/api/v1/attendance/check-out", json={}, headers=employee_headers)

    # Second check-out attempt
    response = client.post("/api/v1/attendance/check-out", json={}, headers=employee_headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already checked out" in response.json()["detail"].lower()


def test_get_my_today_attendance(client, employee_headers):
    # Before check-in
    res1 = client.get("/api/v1/attendance/me/today", headers=employee_headers)
    assert res1.status_code == status.HTTP_200_OK
    assert res1.json() is None

    # After check-in
    client.post("/api/v1/attendance/check-in", json={}, headers=employee_headers)
    res2 = client.get("/api/v1/attendance/me/today", headers=employee_headers)
    assert res2.status_code == status.HTTP_200_OK
    assert res2.json()["check_in_time"] is not None


def test_hr_attendance_summary(client, hr_headers, employee_headers):
    client.post("/api/v1/attendance/check-in", json={}, headers=employee_headers)
    response = client.get("/api/v1/attendance/summary", headers=hr_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_employees"] >= 1
    assert data["checked_in_active"] >= 1
