from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IdMixin, TimestampMixin
from app.models.enums import BusinessStatus


class Business(IdMixin, TimestampMixin, Base):
    __tablename__ = "businesses"

    owner_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    address_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lat: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    lng: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    status: Mapped[BusinessStatus] = mapped_column(String(40), default=BusinessStatus.BORRADOR, nullable=False)
    reputation_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sponsor_label: Mapped[str | None] = mapped_column(String(80), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(nullable=True)
    rejected_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
