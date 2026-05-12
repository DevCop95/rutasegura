from pydantic import BaseModel, Field

from app.models.enums import UserType
from app.schemas.user import UserPublic


class RegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    alias: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=8, max_length=128)
    user_type: UserType = UserType.CITIZEN


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
