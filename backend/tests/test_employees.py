from fastapi import status


def test_get_my_profile(client, employee_headers, employee_user):
    response = client.get("/api/v1/employees/me", headers=employee_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == employee_user.id
    assert data["email"] == employee_user.email
    assert data["profile"]["department"] == "Engineering"


def test_update_my_profile(client, employee_headers):
    payload = {
        "phone": "+1999111222",
        "address": "123 Tech Boulevard, Silicon Valley",
        "emergency_contact": "+1999333444",
    }
    response = client.patch("/api/v1/employees/me", json=payload, headers=employee_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["profile"]["phone"] == "+1999111222"
    assert data["profile"]["address"] == "123 Tech Boulevard, Silicon Valley"
    assert data["profile"]["emergency_contact"] == "+1999333444"


def test_hr_update_employee(client, hr_headers, employee_user):
    payload = {
        "department": "Platform Engineering",
        "designation": "Senior Staff Engineer",
        "basic_salary": 115000.0,
    }
    response = client.patch(f"/api/v1/employees/{employee_user.id}", json=payload, headers=hr_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["profile"]["department"] == "Platform Engineering"
    assert data["profile"]["designation"] == "Senior Staff Engineer"
    assert data["profile"]["basic_salary"] == 115000.0


def test_employee_cannot_update_via_admin_endpoint(client, employee_headers, employee_user):
    payload = {"basic_salary": 200000.0}
    response = client.patch(f"/api/v1/employees/{employee_user.id}", json=payload, headers=employee_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_employees_filter_and_search(client, hr_headers, employee_user, second_employee_user):
    # Filter by department
    response = client.get("/api/v1/employees?department=Engineering", headers=hr_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] >= 1
    assert any(emp["id"] == employee_user.id for emp in data["items"])

    # Search by name
    response = client.get("/api/v1/employees?search=Second", headers=hr_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == second_employee_user.id
