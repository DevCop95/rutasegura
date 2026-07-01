from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.business import Business
from app.models.enums import BusinessStatus, VoteValue
from app.models.vote import BusinessVote
from app.schemas.business import (
    BusinessCampaignRequest,
    BusinessCreate,
    BusinessPublic,
    BusinessVoteCreate,
)
from app.services.reputation import vote_weight_for_user

router = APIRouter()

PUBLIC_BUSINESS_STATUSES = (BusinessStatus.APROBADO, BusinessStatus.PENDIENTE_VERIFICACION)


@router.get("", response_model=list[BusinessPublic])
def list_businesses(db: DbSession) -> list[BusinessPublic]:
    businesses = db.scalars(
        select(Business)
        .where(Business.status.in_(PUBLIC_BUSINESS_STATUSES))
        .order_by(Business.created_at.desc())
    ).all()
    return [BusinessPublic.model_validate(business) for business in businesses]


@router.post("", response_model=BusinessPublic, status_code=status.HTTP_201_CREATED)
def create_business(
    payload: BusinessCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> BusinessPublic:
    business = Business(owner_user_id=current_user.id, **payload.model_dump())
    db.add(business)
    db.commit()
    db.refresh(business)
    return BusinessPublic.model_validate(business)


@router.post("/{business_id}/campaign", response_model=BusinessPublic)
def create_campaign(
    business_id: UUID,
    payload: BusinessCampaignRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> BusinessPublic:
    business = db.get(Business, str(business_id))
    if business is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada.")
    if business.owner_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No eres propietario.")

    business.status = BusinessStatus.PENDIENTE_PAGO
    business.sponsor_label = payload.sponsor_label
    db.add(business)
    db.commit()
    db.refresh(business)
    return BusinessPublic.model_validate(business)


@router.post("/{business_id}/votes", response_model=BusinessPublic, status_code=status.HTTP_201_CREATED)
def vote_business(
    business_id: UUID,
    payload: BusinessVoteCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> BusinessPublic:
    business = db.get(Business, str(business_id))
    if business is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada.")
    if business.owner_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes votar tu empresa.")

    existing = db.scalar(
        select(BusinessVote).where(
            BusinessVote.business_id == str(business_id),
            BusinessVote.voter_user_id == current_user.id,
        )
    )
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya votaste esta empresa.")

    vote = BusinessVote(
        business_id=str(business_id),
        voter_user_id=current_user.id,
        vote_value=payload.vote_value,
        reason=payload.reason,
        weight_snapshot=vote_weight_for_user(current_user),
    )
    db.add(vote)
    db.flush()

    votes = db.scalars(select(BusinessVote).where(BusinessVote.business_id == str(business_id))).all()
    yes = sum(item.weight_snapshot for item in votes if item.vote_value == VoteValue.SI)
    no = sum(item.weight_snapshot for item in votes if item.vote_value == VoteValue.NO)
    business.reputation_score = yes - no
    if yes >= 5 and business.status == BusinessStatus.PENDIENTE_PAGO:
        business.status = BusinessStatus.PENDIENTE_VERIFICACION
    if yes >= 8 and yes > no * 2:
        business.status = BusinessStatus.APROBADO
        business.approved_at = datetime.now(timezone.utc)

    db.add(business)
    db.commit()
    db.refresh(business)
    return BusinessPublic.model_validate(business)
