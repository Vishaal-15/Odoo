from fastapi import status


def test_apply_leave_success(client, employee_headers):
    payload = {
        "leave_type": "PAID",
        "start_date": "2026-09-01",
        "end_date": "2026-09-03",
        "reason": "Personal time off with family",
    }
    response = client.post("/api/v1/leaves", json=payload, headers=employee_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["leave_type"] == "PAID"
    assert data["days_count"] == 3
    assert data["status"] == "PENDING"


def test_apply_leave_overlapping_rejected(client, employee_headers):
    # First leave
    client.post(
        "/api/v1/leaves",
        json={
            "leave_type": "PAID",
            "start_date": "2026-09-10",
            "end_date": "2026-09-15",
            "reason": "Annual vacation",
        },
        headers=employee_headers,
    )

    # Overlapping leave
    response = client.post(
        "/api/v1/leaves",
        json={
            "leave_type": "SICK",
            "start_date": "2026-09-12",
            "end_date": "2026-09-14",
            "reason": "Doctor appointment",
        },
        headers=employee_headers,
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "existing leave application" in response.json()["detail"].lower()


def test_hr_approve_leave(client, employee_headers, hr_headers, hr_user):
    # Apply
    res = client.post(
        "/api/v1/leaves",
        json={
            "leave_type": "PAID",
            "start_date": "2026-10-01",
            "end_date": "2026-10-02",
            "reason": "Conference",
        },
        headers=employee_headers,
    )
    leave_id = res.json()["id"]

    # HR approves
    review_res = client.patch(
        f"/api/v1/leaves/{leave_id}/status",
        json={"status": "APPROVED", "reviewer_comments": "Approved. Enjoy the conference!"},
        headers=hr_headers,
    )
    assert review_res.status_code == status.HTTP_200_OK
    data = review_res.json()
    assert data["status"] == "APPROVED"
    assert data["reviewer_id"] == hr_user.id
    assert data["reviewer_comments"] == "Approved. Enjoy the conference!"


def test_employee_cannot_review_leave(client, employee_headers):
    res = client.post(
        "/api/v1/leaves",
        json={
            "leave_type": "PAID",
            "start_date": "2026-11-01",
            "end_date": "2026-11-02",
            "reason": "Personal",
        },
        headers=employee_headers,
    )
    leave_id = res.json()["id"]

    # Employee attempts to self-approve
    review_res = client.patch(
        f"/api/v1/leaves/{leave_id}/status",
        json={"status": "APPROVED"},
        headers=employee_headers,
    )
    assert review_res.status_code == status.HTTP_403_FORBIDDEN


def test_employee_cancel_pending_leave(client, employee_headers):
    res = client.post(
        "/api/v1/leaves",
        json={
            "leave_type": "PAID",
            "start_date": "2026-12-01",
            "end_date": "2026-12-02",
            "reason": "Trip",
        },
        headers=employee_headers,
    )
    leave_id = res.json()["id"]

    delete_res = client.delete(f"/api/v1/leaves/{leave_id}", headers=employee_headers)
    assert delete_res.status_code == status.HTTP_204_NO_CONTENT
