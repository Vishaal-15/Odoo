from fastapi import status


def test_analytics_endpoints(client, hr_headers, employee_headers):
    # Check-in to generate some stats
    client.post("/api/v1/attendance/check-in", json={}, headers=employee_headers)

    # Overview KPIs
    res_overview = client.get("/api/v1/analytics/overview", headers=hr_headers)
    assert res_overview.status_code == status.HTTP_200_OK
    overview_data = res_overview.json()
    assert overview_data["total_employees"] >= 1
    assert "present_today" in overview_data
    assert "monthly_payroll_total" in overview_data

    # Attendance trends
    res_trends = client.get("/api/v1/analytics/attendance-trends?days=7", headers=hr_headers)
    assert res_trends.status_code == status.HTTP_200_OK
    assert len(res_trends.json()) == 7

    # Leave breakdown
    res_leaves = client.get("/api/v1/analytics/leave-breakdown", headers=hr_headers)
    assert res_leaves.status_code == status.HTTP_200_OK
    assert isinstance(res_leaves.json(), list)

    # Department headcount
    res_dept = client.get("/api/v1/analytics/department-headcount", headers=hr_headers)
    assert res_dept.status_code == status.HTTP_200_OK
    assert len(res_dept.json()) >= 1
