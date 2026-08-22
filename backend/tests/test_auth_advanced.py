from fastapi import status


def test_password_policy_enforcement(client):
    # Weak: no uppercase
    res1 = client.post(
        "/api/v1/auth/register",
        json={
            "employee_id": "P01",
            "email": "p01@dayflow.com",
            "password": "password123!",
            "first_name": "Test",
            "last_name": "User",
        },
    )
    assert res1.status_code == status.HTTP_400_BAD_REQUEST
    assert "uppercase" in res1.json()["detail"].lower()

    # Weak: no special character
    res2 = client.post(
        "/api/v1/auth/register",
        json={
            "employee_id": "P02",
            "email": "p02@dayflow.com",
            "password": "Password123",
            "first_name": "Test",
            "last_name": "User",
        },
    )
    assert res2.status_code == status.HTTP_400_BAD_REQUEST
    assert "special character" in res2.json()["detail"].lower()

    # Weak: too short
    res3 = client.post(
        "/api/v1/auth/register",
        json={
            "employee_id": "P03",
            "email": "p03@dayflow.com",
            "password": "P1!",
            "first_name": "Test",
            "last_name": "User",
        },
    )
    # Pydantic Field min_length=8 or validator
    assert res3.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_ENTITY)


def test_refresh_token_rotation_and_revocation(client, employee_user):
    # Login to get refresh token
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": employee_user.email, "password": "Password123!"},
    )
    assert login_res.status_code == status.HTTP_200_OK
    initial_refresh = login_res.json()["refresh_token"]
    assert initial_refresh is not None

    # Rotate refresh token
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh},
    )
    assert refresh_res.status_code == status.HTTP_200_OK
    new_access_token = refresh_res.json()["access_token"]
    new_refresh_token = refresh_res.json()["refresh_token"]
    assert new_access_token is not None
    assert new_refresh_token != initial_refresh

    # Try re-using the old refresh token (Must fail due to rotation)
    reuse_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh},
    )
    assert reuse_res.status_code == status.HTTP_401_UNAUTHORIZED

    # Logout and revoke new refresh token
    logout_res = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": new_refresh_token},
    )
    assert logout_res.status_code == status.HTTP_200_OK

    # Trying to refresh with logged-out token should fail
    after_logout_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": new_refresh_token},
    )
    assert after_logout_res.status_code == status.HTTP_401_UNAUTHORIZED


def test_email_verification_flow(client):
    # Register new user
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "employee_id": "VRF001",
            "email": "verify.me@dayflow.com",
            "password": "StrongPassword123!",
            "first_name": "Verify",
            "last_name": "User",
        },
    )
    assert reg_res.status_code == status.HTTP_201_CREATED

    # Resend verification to obtain token
    resend_res = client.post(
        "/api/v1/auth/resend-verification",
        json={"email": "verify.me@dayflow.com"},
    )
    assert resend_res.status_code == status.HTTP_200_OK
    token = resend_res.json()["verification_token"]

    # Verify email
    verify_res = client.post(
        "/api/v1/auth/verify-email",
        json={"token": token},
    )
    assert verify_res.status_code == status.HTTP_200_OK
    assert "successfully verified" in verify_res.json()["message"].lower()

    # Second verification attempt fails gracefully
    invalid_verify_res = client.post(
        "/api/v1/auth/verify-email",
        json={"token": "expired-or-invalid-token"},
    )
    assert invalid_verify_res.status_code == status.HTTP_400_BAD_REQUEST


def test_correlation_id_and_health_probes(client):
    # Health checks
    live_res = client.get("/health/live")
    assert live_res.status_code == status.HTTP_200_OK
    assert live_res.json()["status"] == "alive"

    ready_res = client.get("/health/ready")
    assert ready_res.status_code == status.HTTP_200_OK
    assert ready_res.json()["status"] == "ready"

    # Middleware correlation ID and timing headers
    custom_req_id = "test-custom-request-id-1234"
    resp = client.get("/health", headers={"X-Request-ID": custom_req_id})
    assert resp.status_code == status.HTTP_200_OK
    assert resp.headers.get("X-Request-ID") == custom_req_id
    assert "X-Process-Time-Ms" in resp.headers


def test_rate_limiter_behavior(client, employee_user):
    from app.core.limiter import limiter
    limiter.enabled = True
    try:
        # Rapid repeated logins
        statuses = []
        for _ in range(15):
            r = client.post(
                "/api/v1/auth/login",
                json={"email": employee_user.email, "password": "WrongPassword!"},
            )
            statuses.append(r.status_code)
        # Should have at least one 429 after exceeding limit
        assert status.HTTP_429_TOO_MANY_REQUESTS in statuses
    finally:
        limiter.enabled = False
