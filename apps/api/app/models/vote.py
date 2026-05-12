from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IdMixin, TimestampMixin
from app.models.enums import VoteValue


class ReportVote(IdMixin, TimestampMixin, Base):
    __tablename__ = "report_votes"
    __table_args__ = (UniqueConstraint("report_id", "voter_user_id", name="uq_report_vote_once"),)

    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id"), nullable=False)
    voter_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    vote_value: Mapped[VoteValue] = mapped_column(String(40), nullable=False)
    weight_snapshot: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)


class BusinessVote(IdMixin, TimestampMixin, Base):
    __tablename__ = "business_votes"
    __table_args__ = (UniqueConstraint("business_id", "voter_user_id", name="uq_business_vote_once"),)

    business_id: Mapped[str] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    voter_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    vote_value: Mapped[VoteValue] = mapped_column(String(40), nullable=False)
    weight_snapshot: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
