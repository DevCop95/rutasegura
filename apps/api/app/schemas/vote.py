from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.enums import VoteValue
from app.models.report import Report


class ReportVoteCreate(BaseModel):
    vote_value: VoteValue
    reason: str | None = Field(default=None, max_length=500)


class VoteSummary(BaseModel):
    yes: int
    no: int
    unknown: int
    score: Decimal

    @classmethod
    def from_report(cls, report: Report) -> "VoteSummary":
        return cls(
            yes=report.community_yes_count,
            no=report.community_no_count,
            unknown=report.community_unknown_count,
            score=report.community_score,
        )

