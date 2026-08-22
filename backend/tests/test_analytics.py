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
    assert "workforce" in overview_data
    assert "attendance" in overview_data
    assert "leaveStats" in overview_data
    assert "payrollSummary" in overview_data

    # Comprehensive Attendance Analytics
    res_att = client.get("/api/v1/analytics/attendance", headers=hr_headers)
    assert res_att.status_code == status.HTTP_200_OK
    att_data = res_att.json()
    assert "attendance_rate" in att_data
    assert "weekly_trend" in att_data
    assert "daily_trend" in att_data

    # Comprehensive Leave Analytics
    res_leave = client.get("/api/v1/analytics/leave", headers=hr_headers)
    assert res_leave.status_code == status.HTTP_200_OK
    leave_data = res_leave.json()
    assert "breakdown_by_type" in leave_data
    assert "department_stats" in leave_data

    # Comprehensive Employee Analytics
    res_emp = client.get("/api/v1/analytics/employees", headers=hr_headers)
    assert res_emp.status_code == status.HTTP_200_OK
    emp_data = res_emp.json()
    assert "department_headcounts" in emp_data
    assert "role_distribution" in emp_data

    # Comprehensive Payroll Analytics
    res_pay = client.get("/api/v1/analytics/payroll", headers=hr_headers)
    assert res_pay.status_code == status.HTTP_200_OK
    pay_data = res_pay.json()
    assert "total_monthly_outlay" in pay_data
    assert "average_salary" in pay_data

    # Attendance trends
    res_trends = client.get("/api/v1/analytics/attendance-trends?days=7", headers=hr_headers)
    assert res_trends.status_code == status.HTTP_200_OK
    assert len(res_trends.json()) == 7

    # Leave breakdown
    res_leaves = client.get("/api/v1/analytics/leave-breakdown", headers=hr_headers)
    assert res_leaves.status_code == status.HTTP_200_OK
    assert isinstance(res_leaves.json(), list)

    # Department headcount & breakdown
    res_dept = client.get("/api/v1/analytics/department-headcount", headers=hr_headers)
    assert res_dept.status_code == status.HTTP_200_OK
    assert len(res_dept.json()) >= 1

    res_dept_bk = client.get("/api/v1/analytics/department-breakdown", headers=hr_headers)
    assert res_dept_bk.status_code == status.HTTP_200_OK
    assert len(res_dept_bk.json()) >= 1
