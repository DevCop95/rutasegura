from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, Response, status, BackgroundTasks
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import UserType
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    RegisterResponse,
    VerifyEmailRequest,
    ResendCodeRequest,
)
from app.schemas.user import UserPublic
from app.services import UserService

router = APIRouter()


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: DbSession,
) -> RegisterResponse:
    user = UserService.register(db, payload, background_tasks)
    return RegisterResponse(status="verification_required", email=user.email)


@router.post("/verify", response_model=TokenResponse)
def verify(payload: VerifyEmailRequest, response: Response, db: DbSession) -> TokenResponse:
    user = UserService.verify(db, payload)
    
    # Iniciar sesión automáticamente (HTTP concern)
    token = create_access_token(subject=str(user.id))
    response.set_cookie("rs_session", token, httponly=True, samesite="lax")
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


@router.post("/resend-code")
def resend_code(
    payload: ResendCodeRequest,
    background_tasks: BackgroundTasks,
    db: DbSession,
) -> dict:
    user = UserService.resend_code(db, payload, background_tasks)
    return {"status": "code_resent", "email": user.email}




@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: DbSession) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower(), User.is_active.is_(True)))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas.")

    user.last_login_at = datetime.now(timezone.utc)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=str(user.id))
    response.set_cookie("rs_session", token, httponly=True, samesite="lax")
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie("rs_session")


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUser) -> UserPublic:
    return UserPublic.model_validate(current_user)
