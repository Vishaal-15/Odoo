from fastapi import status


def test_employee_cannot_list_all_employees(client, employee_headers):
    response = client.get("/api/v1/employees", headers=employee_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_hr_can_list_all_employees(client, hr_headers):
    response = client.get("/api/v1/employees", headers=hr_headers)
    assert response.status_code == status.HTTP_200_OK


def test_admin_can_list_all_employees(client, admin_headers):
    response = client.get("/api/v1/employees", headers=admin_headers)
    assert response.status_code == status.HTTP_200_OK


def test_employee_cannot_view_other_employee_profile(client, employee_headers, second_employee_user):
    response = client.get(f"/api/v1/employees/{second_employee_user.id}", headers=employee_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_employee_can_view_own_employee_profile(client, employee_headers, employee_user):
    response = client.get(f"/api/v1/employees/{employee_user.id}", headers=employee_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == employee_user.id


def test_hr_can_view_any_employee_profile(client, hr_headers, employee_user):
    response = client.get(f"/api/v1/employees/{employee_user.id}", headers=hr_headers)
    assert response.status_code == status.HTTP_200_OK


def test_employee_cannot_access_analytics(client, employee_headers):
    response = client.get("/api/v1/analytics/overview", headers=employee_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_hr_can_access_analytics(client, hr_headers):
    response = client.get("/api/v1/analytics/overview", headers=hr_headers)
    assert response.status_code == status.HTTP_200_OK
