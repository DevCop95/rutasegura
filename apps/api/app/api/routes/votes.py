from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.report import Report
from app.models.vote import ReportVote
from app.schemas.vote import ReportVoteCreate, VoteSummary
from app.services.reputation import vote_weight_for_user
from app.services.votes import recalculate_report_vote_summary

router = APIRouter()


@router.post("/reports/{report_id}/votes", response_model=VoteSummary, status_code=status.HTTP_201_CREATED)
def vote_report(
    report_id: UUID,
    payload: ReportVoteCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> VoteSummary:
    report = db.get(Report, str(report_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado.")
    if report.creator_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes votar tu propio reporte.")

    existing = db.scalar(
        select(ReportVote).where(
            ReportVote.report_id == str(report_id),
            ReportVote.voter_user_id == current_user.id,
        )
    )
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya votaste este reporte.")

    vote = ReportVote(
        report_id=str(report_id),
        voter_user_id=current_user.id,
        vote_value=payload.vote_value,
        reason=payload.reason,
        weight_snapshot=vote_weight_for_user(current_user),
    )
    db.add(vote)
    db.flush()
    recalculate_report_vote_summary(db, report)
    db.commit()
    db.refresh(report)

    return VoteSummary.from_report(report)


@router.get("/reports/{report_id}/votes/summary", response_model=VoteSummary)
def report_vote_summary(report_id: UUID, db: DbSession) -> VoteSummary:
    report = db.get(Report, str(report_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado.")
    return VoteSummary.from_report(report)
