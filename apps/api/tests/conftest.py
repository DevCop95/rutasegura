import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.enums import UserType
from app.models.user import User

TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(name="client")
def client_fixture():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


def register_and_login(
    client: TestClient,
    email: str,
    alias: str = "Tester",
    password: str = "StrongPassword@123",
) -> str:
    """Registers a CITIZEN user, verifies via the DB-stored code, and returns an access token."""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "alias": alias, "password": password, "user_type": "CITIZEN"},
    )
    assert response.status_code == 201, response.text

    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == email.lower()).first()
    code = user.verification_code
    db.close()

    response = client.post("/api/v1/auth/verify", json={"email": email, "code": code})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def make_admin_token(
    client: TestClient,
    email: str = "admin@rutasegura.test",
    alias: str = "AdminTester",
    password: str = "AdminPassword@123",
) -> str:
    """Creates an active ADMIN user directly in the DB, since /register always
    downgrades a requested ADMIN role to CITIZEN, then logs in via the API."""
    db = TestingSessionLocal()
    admin = User(
        email=email.lower(),
        alias=alias,
        password_hash=hash_password(password),
        user_type=UserType.ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.close()

    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
