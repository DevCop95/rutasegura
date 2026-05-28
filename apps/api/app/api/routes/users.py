from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.user import User
from app.schemas.user import UserPublic, UserUpdate

router = APIRouter()


@router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: UUID, db: DbSession) -> UserPublic:
    user = db.scalar(select(User).where(User.id == str(user_id), User.is_active.is_(True)))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    return UserPublic.model_validate(user)


@router.patch("/me", response_model=UserPublic)
def update_me(payload: UserUpdate, current_user: CurrentUser, db: DbSession) -> UserPublic:
    if payload.alias is not None:
        current_user.alias = payload.alias
    if payload.photo_url is not None:
        current_user.photo_url = payload.photo_url
    if payload.is_womens_mode_verified is not None:
        current_user.is_womens_mode_verified = payload.is_womens_mode_verified

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserPublic.model_validate(current_user)
