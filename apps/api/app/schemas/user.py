from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import UserType


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    alias: str
    photo_url: str | None = None
    user_type: UserType
    rank: str
    reputation_score: int
    reports_verified_count: int
    reports_unverified_count: int
    reports_rejected_count: int
    votes_cast_count: int
    is_womens_mode_verified: bool
    created_at: datetime


class UserUpdate(BaseModel):
    alias: str | None = Field(default=None, min_length=3, max_length=80)
    photo_url: str | None = Field(default=None, max_length=500)
    is_womens_mode_verified: bool | None = Field(default=None)

