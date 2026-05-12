from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ReportStatus, VoteValue
from app.models.report import Report
from app.models.vote import ReportVote


def recalculate_report_vote_summary(db: Session, report: Report) -> None:
    votes = db.scalars(select(ReportVote).where(ReportVote.report_id == report.id)).all()

    yes = sum(vote.weight_snapshot for vote in votes if vote.vote_value == VoteValue.SI)
    no = sum(vote.weight_snapshot for vote in votes if vote.vote_value == VoteValue.NO)
    unknown = sum(vote.weight_snapshot for vote in votes if vote.vote_value == VoteValue.NO_SE)

    report.community_yes_count = yes
    report.community_no_count = no
    report.community_unknown_count = unknown
    report.community_score = Decimal(yes - no)

    decisive_votes = yes + no
    if decisive_votes >= 5 and yes / decisive_votes >= 0.7 and len(votes) >= 3:
        report.status = ReportStatus.COMUNITARIAMENTE_CONFIABLE
    elif decisive_votes >= 5 and no / decisive_votes >= 0.7 and len(votes) >= 3:
        report.status = ReportStatus.RECHAZADO

    db.add(report)

