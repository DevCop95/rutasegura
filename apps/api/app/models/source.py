from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IdMixin, TimestampMixin
from app.models.enums import SourceStatus


class ReportSource(IdMixin, TimestampMixin, Base):
    __tablename__ = "report_sources"
    __table_args__ = (UniqueConstraint("report_id", "url", name="uq_report_source_url"),)

    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id"), nullable=False)
    submitted_by_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    source_domain: Mapped[str | None] = mapped_column(String(255), nullable=True)
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(nullable=True)
    extracted_text_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[SourceStatus] = mapped_column(String(40), default=SourceStatus.PENDIENTE, nullable=False)
    match_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
