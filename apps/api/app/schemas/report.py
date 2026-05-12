from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ReportStatus, ReportType
from app.schemas.geo import CartagenaBoundsMixin


class ReportCreate(CartagenaBoundsMixin):
    title: str = Field(min_length=5, max_length=140)
    description: str = Field(min_length=10, max_length=1500)
    incident_category: str = Field(min_length=3, max_length=80)
    occurred_at: datetime
    lat: Decimal = Field(ge=Decimal("-90"), le=Decimal("90"))
    lng: Decimal = Field(ge=Decimal("-180"), le=Decimal("180"))
    city: str = Field(default="Cartagena", min_length=2, max_length=120)
    neighborhood: str | None = Field(default=None, max_length=120)


class ReportPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    creator_user_id: UUID
    parent_report_id: UUID | None = None
    report_type: ReportType
    status: ReportStatus
    title: str
    description: str
    incident_category: str
    occurred_at: datetime
    lat: Decimal
    lng: Decimal
    city: str
    neighborhood: str | None = None
    is_historical: bool
    duplicate_group_count: int
    community_yes_count: int
    community_no_count: int
    community_unknown_count: int
    community_score: Decimal
    created_at: datetime
