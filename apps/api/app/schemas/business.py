from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import BusinessStatus, VoteValue
from app.schemas.geo import CartagenaBoundsMixin


class BusinessCreate(CartagenaBoundsMixin):
    name: str = Field(min_length=3, max_length=160)
    category: str = Field(min_length=3, max_length=80)
    description: str | None = Field(default=None, max_length=1200)
    address_text: str | None = Field(default=None, max_length=255)
    lat: Decimal = Field(ge=Decimal("-90"), le=Decimal("90"))
    lng: Decimal = Field(ge=Decimal("-180"), le=Decimal("180"))


class BusinessCampaignRequest(BaseModel):
    sponsor_label: str = Field(default="Punto seguro patrocinado", max_length=80)


class BusinessVoteCreate(BaseModel):
    vote_value: VoteValue
    reason: str | None = Field(default=None, max_length=500)


class BusinessPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_user_id: UUID
    name: str
    category: str
    description: str | None = None
    address_text: str | None = None
    lat: Decimal
    lng: Decimal
    status: BusinessStatus
    reputation_score: int
    sponsor_label: str | None = None
    approved_at: datetime | None = None
    rejected_reason: str | None = None
    created_at: datetime
