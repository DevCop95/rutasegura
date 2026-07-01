from pydantic import BaseModel, Field
from uuid import UUID


class HideReportRequest(BaseModel):
    reason: str = Field(min_length=8, max_length=500)


class MarkDuplicateRequest(BaseModel):
    parent_report_id: UUID


class RejectBusinessRequest(BaseModel):
    reason: str = Field(min_length=8, max_length=500)


class AcceptSourceRequest(BaseModel):
    review_notes: str | None = Field(default=None, max_length=500)


class RejectSourceRequest(BaseModel):
    reason: str = Field(min_length=8, max_length=500)
