from datetime import datetime

from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.models.enums import UserType


class User(IdMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    alias: Mapped[str] = mapped_column(String(80), nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    user_type: Mapped[UserType] = mapped_column(String(40), default=UserType.CITIZEN, nullable=False)
    rank: Mapped[str] = mapped_column(String(40), default="CIUDADANO", nullable=False)
    reputation_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reports_verified_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reports_unverified_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reports_rejected_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    votes_cast_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    reports = relationship("Report", back_populates="creator")
