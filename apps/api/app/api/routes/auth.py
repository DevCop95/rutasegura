from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import UserType
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserPublic

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: DbSession) -> TokenResponse:
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya esta registrado.")

    requested_type = payload.user_type
    if requested_type == UserType.ADMIN and settings.rutasegura_env != "local":
        requested_type = UserType.CITIZEN

    user = User(
        email=payload.email.lower(),
        alias=payload.alias,
        password_hash=hash_password(payload.password),
        user_type=requested_type,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=str(user.id))
    response.set_cookie("rs_session", token, httponly=True, samesite="lax")
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


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
