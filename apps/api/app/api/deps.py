from typing import Annotated
from uuid import UUID

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.enums import UserType
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

DbSession = Annotated[Session, Depends(get_db)]
BearerToken = Annotated[str | None, Depends(oauth2_scheme)]
SessionCookie = Annotated[str | None, Cookie(alias="rs_session")]


def get_current_user(db: DbSession, token: BearerToken, session_cookie: SessionCookie = None) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la sesion.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_value = token or session_cookie
    if token_value is None:
        raise credentials_error

    try:
        payload = jwt.decode(token_value, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_error
        UUID(user_id)
    except (JWTError, ValueError) as exc:
        raise credentials_error from exc

    user = db.scalar(select(User).where(User.id == user_id, User.is_active.is_(True)))
    if user is None:
        raise credentials_error
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_admin(current_user: CurrentUser) -> User:
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Requiere rol admin.")
    return current_user


AdminUser = Annotated[User, Depends(require_admin)]
