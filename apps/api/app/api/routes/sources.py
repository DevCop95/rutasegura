from urllib.parse import urlparse
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import AdminUser, DbSession
from app.models.report import Report
from app.models.source import ReportSource
from app.schemas.source import ReportSourceCreate, ReportSourcePublic

router = APIRouter()


@router.post(
    "/reports/{report_id}/sources",
    response_model=ReportSourcePublic,
    status_code=status.HTTP_201_CREATED,
)
def submit_report_source(
    report_id: UUID,
    payload: ReportSourceCreate,
    admin: AdminUser,
    db: DbSession,
) -> ReportSourcePublic:
    report = db.get(Report, str(report_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado.")

    existing = db.scalar(
        select(ReportSource).where(
            ReportSource.report_id == str(report_id),
            ReportSource.url == payload.url,
        )
    )
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Esta fuente ya fue enviada.")

    parsed = urlparse(payload.url)
    source = ReportSource(
        report_id=str(report_id),
        submitted_by_user_id=admin.id,
        url=payload.url,
        source_domain=parsed.netloc.lower() or None,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return ReportSourcePublic.model_validate(source)


@router.get("/reports/{report_id}/sources", response_model=list[ReportSourcePublic])
def list_report_sources(report_id: UUID, db: DbSession) -> list[ReportSourcePublic]:
    sources = db.scalars(
        select(ReportSource).where(ReportSource.report_id == str(report_id)).order_by(ReportSource.created_at.desc())
    ).all()
    return [ReportSourcePublic.model_validate(source) for source in sources]
