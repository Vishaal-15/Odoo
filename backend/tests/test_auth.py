from fastapi import status


def test_register_success(client):
    payload = {
        "employee_id": "NEW001",
        "email": "new.user@dayflow.com",
        "password": "Password123!",
        "first_name": "New",
        "last_name": "User",
        "role": "EMPLOYEE",
        "department": "Engineering",
        "designation": "Junior Developer",
        "phone": "+1999888777",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["employee_id"] == "NEW001"
    assert data["email"] == "new.user@dayflow.com"
    assert data["role"] == "EMPLOYEE"
    assert data["profile"]["first_name"] == "New"
    assert data["profile"]["department"] == "Engineering"
    assert "password" not in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client, employee_user):
    payload = {
        "employee_id": "DIFF001",
        "email": employee_user.email,  # duplicate
        "password": "Password123!",
        "first_name": "Duplicate",
        "last_name": "Email",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email already exists" in response.json()["detail"].lower()


def test_register_duplicate_employee_id(client, employee_user):
    payload = {
        "employee_id": employee_user.employee_id,  # duplicate
        "email": "unique.email@dayflow.com",
        "password": "Password123!",
        "first_name": "Duplicate",
        "last_name": "EmpId",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "employee id already exists" in response.json()["detail"].lower()


def test_login_success(client, employee_user):
    payload = {
        "email": employee_user.email,
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == employee_user.email
    assert data["user"]["role"] == "EMPLOYEE"


def test_login_invalid_password(client, employee_user):
    payload = {
        "email": employee_user.email,
        "password": "WrongPassword!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "incorrect email or password" in response.json()["detail"].lower()


def test_login_nonexistent_user(client):
    payload = {
        "email": "nobody@dayflow.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_me_authenticated(client, employee_headers, employee_user):
    response = client.get("/api/v1/auth/me", headers=employee_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == employee_user.id
    assert data["email"] == employee_user.email
    assert data["profile"]["first_name"] == "Employee"


def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_me_invalid_token(client):
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
