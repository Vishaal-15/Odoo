from fastapi import status


def test_notifications_lifecycle(client, employee_headers, hr_headers):
    # Trigger notification via leave application
    client.post(
        "/api/v1/leaves",
        json={
            "leave_type": "SICK",
            "start_date": "2026-08-28",
            "end_date": "2026-08-29",
            "reason": "Flu",
        },
        headers=employee_headers,
    )

    # HR checks notifications
    hr_notifs_res = client.get("/api/v1/notifications", headers=hr_headers)
    assert hr_notifs_res.status_code == status.HTTP_200_OK
    data = hr_notifs_res.json()
    assert data["unread_count"] >= 1
    assert len(data["items"]) >= 1

    notif_id = data["items"][0]["id"]

    # HR marks one notification as read
    mark_res = client.patch(f"/api/v1/notifications/{notif_id}/read", headers=hr_headers)
    assert mark_res.status_code == status.HTTP_200_OK
    assert mark_res.json()["is_read"] is True

    # Mark all read
    read_all_res = client.patch("/api/v1/notifications/read-all", headers=hr_headers)
    assert read_all_res.status_code == status.HTTP_200_OK
