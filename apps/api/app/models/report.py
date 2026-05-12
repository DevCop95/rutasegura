from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin
from app.models.enums import ReportStatus, ReportType


class Report(IdMixin, TimestampMixin, Base):
    __tablename__ = "reports"

    creator_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    parent_report_id: Mapped[str | None] = mapped_column(ForeignKey("reports.id"), nullable=True)
    report_type: Mapped[ReportType] = mapped_column(String(40), default=ReportType.INSTANTANEO, nullable=False)
    status: Mapped[ReportStatus] = mapped_column(
        String(40),
        default=ReportStatus.NO_VERIFICADO,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(140), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    incident_category: Mapped[str] = mapped_column(String(80), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(nullable=False)
    lat: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    lng: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    neighborhood: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_historical: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    duplicate_group_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    community_yes_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    community_no_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    community_unknown_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    community_score: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0, nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(nullable=True)
    hidden_at: Mapped[datetime | None] = mapped_column(nullable=True)
    hidden_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    creator = relationship("User", back_populates="reports")
