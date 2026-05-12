from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ReportStatus, ReportType
from app.models.report import Report
from app.models.user import User
from app.services.reputation import rank_for_score


def mark_old_instant_reports_historical(db: Session, now: datetime | None = None) -> int:
    cutoff = (now or datetime.now(timezone.utc)) - timedelta(hours=24)
    reports = db.scalars(
        select(Report).where(
            Report.report_type == ReportType.INSTANTANEO,
            Report.status == ReportStatus.NO_VERIFICADO,
            Report.is_historical.is_(False),
            Report.occurred_at <= cutoff,
        )
    ).all()

    for report in reports:
        report.is_historical = True
        db.add(report)

    db.commit()
    return len(reports)


def recalculate_user_ranks(db: Session) -> int:
    users = db.scalars(select(User).where(User.is_active.is_(True))).all()
    for user in users:
        user.rank = rank_for_score(user.reputation_score)
        db.add(user)
    db.commit()
    return len(users)
