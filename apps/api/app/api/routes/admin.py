from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import AdminUser, DbSession
from app.models.business import Business
from app.models.enums import BusinessStatus, ReportStatus
from app.models.report import Report
from app.schemas.admin import HideReportRequest, MarkDuplicateRequest, RejectBusinessRequest
from app.schemas.business import BusinessPublic
from app.schemas.report import ReportPublic

router = APIRouter()


def _creates_cycle(db: DbSession, report_id: str, candidate_parent_id: str) -> bool:
    """Detects whether pointing report_id -> candidate_parent_id closes a cycle
    by walking candidate_parent_id's existing ancestor chain."""
    visited: set[str] = set()
    current = db.get(Report, candidate_parent_id)
    while current is not None and current.parent_report_id is not None:
        if current.parent_report_id == report_id:
            return True
        if current.parent_report_id in visited:
            break
        visited.add(current.parent_report_id)
        current = db.get(Report, current.parent_report_id)
    return False


@router.get("/reports", response_model=list[ReportPublic])
def list_reports_for_admin(admin: AdminUser, db: DbSession) -> list[ReportPublic]:
    reports = db.scalars(select(Report).order_by(Report.created_at.desc()).limit(200)).all()
    return [ReportPublic.model_validate(report) for report in reports]


@router.post("/reports/{report_id}/hide", response_model=ReportPublic)
def hide_report(
    report_id: UUID,
    payload: HideReportRequest,
    admin: AdminUser,
    db: DbSession,
) -> ReportPublic:
    report = db.get(Report, str(report_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado.")

    report.status = ReportStatus.OCULTO
    report.hidden_at = datetime.now(timezone.utc)
    report.hidden_reason = f"{payload.reason} | admin={admin.id}"
    db.add(report)
    db.commit()
    db.refresh(report)
    return ReportPublic.model_validate(report)


@router.post("/reports/{report_id}/duplicate", response_model=ReportPublic)
def mark_duplicate(
    report_id: UUID,
    payload: MarkDuplicateRequest,
    admin: AdminUser,
    db: DbSession,
) -> ReportPublic:
    report = db.get(Report, str(report_id))
    parent = db.get(Report, str(payload.parent_report_id))
    if report is None or parent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado.")
    if report.id == parent.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El padre debe ser distinto.")
    if _creates_cycle(db, report.id, parent.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esa fusion crearia una cadena circular de duplicados.",
        )

    report.parent_report_id = parent.id
    parent.duplicate_group_count += 1
    report.hidden_reason = f"Fusionado por admin={admin.id}"
    db.add(report)
    db.add(parent)
    db.commit()
    db.refresh(report)
    return ReportPublic.model_validate(report)


@router.post("/reports/{report_id}/restore", response_model=ReportPublic)
def restore_report(report_id: UUID, admin: AdminUser, db: DbSession) -> ReportPublic:
    report = db.get(Report, str(report_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado.")

    report.status = ReportStatus.NO_VERIFICADO
    report.hidden_at = None
    report.hidden_reason = f"Restaurado por admin={admin.id}"
    db.add(report)
    db.commit()
    db.refresh(report)
    return ReportPublic.model_validate(report)


@router.get("/businesses", response_model=list[BusinessPublic])
def list_businesses_for_admin(admin: AdminUser, db: DbSession) -> list[BusinessPublic]:
    businesses = db.scalars(select(Business).order_by(Business.created_at.desc()).limit(200)).all()
    return [BusinessPublic.model_validate(business) for business in businesses]


@router.post("/businesses/{business_id}/approve", response_model=BusinessPublic)
def approve_business(business_id: UUID, admin: AdminUser, db: DbSession) -> BusinessPublic:
    business = db.get(Business, str(business_id))
    if business is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada.")

    business.status = BusinessStatus.APROBADO
    business.approved_at = datetime.now(timezone.utc)
    business.rejected_reason = None
    business.sponsor_label = business.sponsor_label or "Punto seguro patrocinado"
    db.add(business)
    db.commit()
    db.refresh(business)
    return BusinessPublic.model_validate(business)


@router.post("/businesses/{business_id}/reject", response_model=BusinessPublic)
def reject_business(
    business_id: UUID,
    payload: RejectBusinessRequest,
    admin: AdminUser,
    db: DbSession,
) -> BusinessPublic:
    business = db.get(Business, str(business_id))
    if business is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada.")

    business.status = BusinessStatus.RECHAZADO
    business.rejected_reason = f"{payload.reason} | admin={admin.id}"
    db.add(business)
    db.commit()
    db.refresh(business)
    return BusinessPublic.model_validate(business)
