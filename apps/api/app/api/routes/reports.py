from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.enums import ReportStatus
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportPublic
from app.services.duplicates import find_duplicate_parent_id

HIDDEN_STATUSES = (ReportStatus.OCULTO, ReportStatus.RECHAZADO)

router = APIRouter()


@router.post("", response_model=ReportPublic, status_code=status.HTTP_201_CREATED)
def create_report(payload: ReportCreate, current_user: CurrentUser, db: DbSession) -> ReportPublic:
    parent_id = find_duplicate_parent_id(
        db=db,
        category=payload.incident_category,
        city=payload.city,
        occurred_at=payload.occurred_at,
        lat=payload.lat,
        lng=payload.lng,
    )

    report = Report(
        creator_user_id=current_user.id,
        parent_report_id=parent_id,
        title=payload.title,
        description=payload.description,
        incident_category=payload.incident_category,
        occurred_at=payload.occurred_at,
        lat=payload.lat,
        lng=payload.lng,
        city=payload.city,
        neighborhood=payload.neighborhood,
        is_womens_mode_relevant=payload.is_womens_mode_relevant,
    )
    db.add(report)
    if parent_id is not None:
        parent = db.get(Report, parent_id)
        if parent is not None:
            parent.duplicate_group_count += 1
            db.add(parent)
    db.commit()
    db.refresh(report)
    return ReportPublic.model_validate(report)


@router.get("", response_model=list[ReportPublic])
def list_reports(
    db: DbSession,
    city: str = Query(default="Cartagena"),
    status_filter: str | None = Query(default=None, alias="status"),
    neighborhood: str | None = Query(default=None),
    womens_mode: bool | None = Query(default=None),
    limit: int = Query(default=100, le=250),
) -> list[ReportPublic]:
    query = select(Report).where(Report.city == city).order_by(Report.occurred_at.desc()).limit(limit)
    if status_filter is not None:
        query = query.where(Report.status == status_filter)
    else:
        query = query.where(Report.status.notin_(HIDDEN_STATUSES))
    if neighborhood is not None:
        query = query.where(Report.neighborhood == neighborhood)
    if womens_mode is True:
        query = query.where(Report.is_womens_mode_relevant.is_(True))

    reports = db.scalars(query).all()
    return [ReportPublic.model_validate(report) for report in reports]


@router.get("/{report_id}", response_model=ReportPublic)
def get_report(report_id: UUID, db: DbSession) -> ReportPublic:
    report = db.get(Report, str(report_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado.")
    return ReportPublic.model_validate(report)


@router.get("/{report_id}/children", response_model=list[ReportPublic])
def get_report_children(report_id: UUID, db: DbSession) -> list[ReportPublic]:
    reports = db.scalars(select(Report).where(Report.parent_report_id == str(report_id))).all()
    return [ReportPublic.model_validate(report) for report in reports]
