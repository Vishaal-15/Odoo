from fastapi import status


def test_admin_can_view_audit_logs(client, admin_headers):
    response = client.get("/api/v1/audit-logs", headers=admin_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total" in data
    assert "items" in data


def test_employee_cannot_view_audit_logs(client, employee_headers):
    response = client.get("/api/v1/audit-logs", headers=employee_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_hr_cannot_view_audit_logs(client, hr_headers):
    response = client.get("/api/v1/audit-logs", headers=hr_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_salary_update_triggers_audit_log(client, hr_headers, admin_headers, employee_user):
    # HR updates salary
    payload = {"basic_salary": 99000.0}
    update_res = client.patch(f"/api/v1/employees/{employee_user.id}", json=payload, headers=hr_headers)
    assert update_res.status_code == status.HTTP_200_OK

    # Admin checks audit logs
    audit_res = client.get("/api/v1/audit-logs?action=ADMIN_UPDATE_EMPLOYEE", headers=admin_headers)
    assert audit_res.status_code == status.HTTP_200_OK
    items = audit_res.json()["items"]
    assert len(items) >= 1
    assert any(str(employee_user.id) == item["resource_id"] for item in items)


def test_soft_delete_employee(client, admin_headers, second_employee_user):
    # Soft delete
    del_res = client.delete(f"/api/v1/employees/{second_employee_user.id}", headers=admin_headers)
    assert del_res.status_code == status.HTTP_200_OK

    # Verify soft deleted user is not in employee list
    list_res = client.get("/api/v1/employees", headers=admin_headers)
    assert list_res.status_code == status.HTTP_200_OK
    assert all(emp["id"] != second_employee_user.id for emp in list_res.json()["items"])

    # Verify audit log exists
    audit_res = client.get("/api/v1/audit-logs?action=SOFT_DELETE_EMPLOYEE", headers=admin_headers)
    assert audit_res.status_code == status.HTTP_200_OK
    assert audit_res.json()["total"] >= 1
