from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ReportStatus
from app.models.report import Report

DUPLICATE_WINDOW = timedelta(hours=2)
DUPLICATE_MAX_DISTANCE_METERS = 150


def find_duplicate_parent_id(
    db: Session,
    category: str,
    city: str,
    occurred_at: datetime,
    lat: Decimal,
    lng: Decimal,
) -> str | None:
    """Find a likely parent report using SQLite-friendly distance and a narrow time window."""
    candidates = db.scalars(
        select(Report)
        .where(
            Report.city == city,
            Report.incident_category == category,
            Report.status != ReportStatus.OCULTO,
            Report.occurred_at >= occurred_at - DUPLICATE_WINDOW,
            Report.occurred_at <= occurred_at + DUPLICATE_WINDOW,
        )
        .order_by(Report.community_score.desc(), Report.occurred_at.asc())
        .limit(25)
    ).all()

    for report in candidates:
        distance = _rough_distance_meters(float(lat), float(lng), float(report.lat), float(report.lng))
        if distance <= DUPLICATE_MAX_DISTANCE_METERS:
            return report.parent_report_id or report.id
    return None


def _rough_distance_meters(lat_a: float, lng_a: float, lat_b: float, lng_b: float) -> float:
    lat_meters = (lat_a - lat_b) * 111_320
    lng_meters = (lng_a - lng_b) * 111_320
    return (lat_meters**2 + lng_meters**2) ** 0.5
