from fastapi.testclient import TestClient

from conftest import TestingSessionLocal


def test_auth_verification_flow(client: TestClient) -> None:
    # 1. Register a new user
    reg_payload = {
        "email": "test@example.com",
        "alias": "TestUser",
        "password": "StrongPassword@123",
        "user_type": "CITIZEN"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "verification_required"
    assert data["email"] == "test@example.com"

    # Fetch the verification code directly from the testing database to simulate reading the email/console log
    db = TestingSessionLocal()
    from app.models.user import User
    user = db.query(User).filter(User.email == "test@example.com").first()
    assert user is not None
    assert not user.is_active
    assert user.verification_code is not None
    code = user.verification_code
    db.close()

    # 2. Try to verify with an incorrect code
    verify_payload_bad = {
        "email": "test@example.com",
        "code": "000000"
    }
    response = client.post("/api/v1/auth/verify", json=verify_payload_bad)
    assert response.status_code == 400
    assert response.json()["detail"] == "Código de verificación inválido."

    # 3. Verify with the correct code
    verify_payload_good = {
        "email": "test@example.com",
        "code": code
    }
    response = client.post("/api/v1/auth/verify", json=verify_payload_good)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["alias"] == "TestUser"


    # Confirm user is active now
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "test@example.com").first()
    assert user.is_active
    assert user.verification_code is None
    db.close()


def test_resend_verification_code(client: TestClient) -> None:
    # 1. Register
    reg_payload = {
        "email": "resend@example.com",
        "alias": "ResendUser",
        "password": "StrongPassword@123",
        "user_type": "CITIZEN"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201

    db = TestingSessionLocal()
    from app.models.user import User
    user = db.query(User).filter(User.email == "resend@example.com").first()
    first_code = user.verification_code
    db.close()

    # 2. Request resending code
    resend_payload = {
        "email": "resend@example.com"
    }
    response = client.post("/api/v1/auth/resend-code", json=resend_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "code_resent"

    # Fetch new code
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "resend@example.com").first()
    second_code = user.verification_code
    assert second_code is not None
    assert second_code != first_code
    db.close()

    # 3. Verify with new code
    verify_payload = {
        "email": "resend@example.com",
        "code": second_code
    }
    response = client.post("/api/v1/auth/verify", json=verify_payload)
    assert response.status_code == 200


def test_password_security_validation(client: TestClient) -> None:
    # 1. Try to register with password that doesn't have uppercase
    reg_payload_no_upper = {
        "email": "weak1@example.com",
        "alias": "WeakUser1",
        "password": "weakpassword123@",
        "user_type": "CITIZEN"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload_no_upper)
    assert response.status_code == 422
    assert "mayúscula" in response.text

    # 2. Try to register with password that doesn't have digit
    reg_payload_no_digit = {
        "email": "weak2@example.com",
        "alias": "WeakUser2",
        "password": "WeakPassword@",
        "user_type": "CITIZEN"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload_no_digit)
    assert response.status_code == 422
    assert "número" in response.text

    # 3. Try to register with password that doesn't have special char
    reg_payload_no_special = {
        "email": "weak3@example.com",
        "alias": "WeakUser3",
        "password": "WeakPassword123",
        "user_type": "CITIZEN"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload_no_special)
    assert response.status_code == 422
    assert "especial" in response.text
