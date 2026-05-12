from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import SourceStatus


class ReportSourceCreate(BaseModel):
    url: str = Field(min_length=10, max_length=1000)


class ReportSourcePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    report_id: UUID
    submitted_by_user_id: UUID
    url: str
    source_domain: str | None = None
    title: str | None = None
    published_at: datetime | None = None
    status: SourceStatus
    match_score: Decimal | None = None
    reviewed_at: datetime | None = None
    review_notes: str | None = None
    created_at: datetime
