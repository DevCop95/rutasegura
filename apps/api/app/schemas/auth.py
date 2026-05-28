import re
from pydantic import BaseModel, Field, field_validator

from app.models.enums import UserType
from app.schemas.user import UserPublic


class RegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    alias: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=8, max_length=128)
    user_type: UserType = UserType.CITIZEN

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula.")
        if not re.search(r"[a-z]", v):
            raise ValueError("La contraseña debe contener al menos una letra minúscula.")
        if not re.search(r"\d", v):
            raise ValueError("La contraseña debe contener al menos un número.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("La contraseña debe contener al menos un carácter especial.")
        return v


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class RegisterResponse(BaseModel):
    status: str
    email: str


class VerifyEmailRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    code: str = Field(min_length=6, max_length=6)


class ResendCodeRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)

