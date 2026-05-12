"""initial sqlite schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-11
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def uuid_pk() -> sa.Column:
    return sa.Column("id", sa.String(length=36), primary_key=True)


def timestamps() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    ]


def upgrade() -> None:
    op.create_table(
        "users",
        uuid_pk(),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("alias", sa.String(length=80), nullable=False),
        sa.Column("photo_url", sa.String(length=500), nullable=True),
        sa.Column("user_type", sa.String(length=40), nullable=False, server_default="CITIZEN"),
        sa.Column("rank", sa.String(length=40), nullable=False, server_default="CIUDADANO"),
        sa.Column("reputation_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reports_verified_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reports_unverified_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reports_rejected_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("votes_cast_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        *timestamps(),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "reports",
        uuid_pk(),
        sa.Column("creator_user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("parent_report_id", sa.String(length=36), sa.ForeignKey("reports.id"), nullable=True),
        sa.Column("report_type", sa.String(length=40), nullable=False, server_default="INSTANTANEO"),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="NO_VERIFICADO"),
        sa.Column("title", sa.String(length=140), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("incident_category", sa.String(length=80), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("lat", sa.Numeric(precision=9, scale=6), nullable=False),
        sa.Column("lng", sa.Numeric(precision=9, scale=6), nullable=False),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("neighborhood", sa.String(length=120), nullable=True),
        sa.Column("is_historical", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("duplicate_group_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("community_yes_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("community_no_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("community_unknown_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("community_score", sa.Numeric(precision=6, scale=2), nullable=False, server_default="0"),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hidden_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hidden_reason", sa.Text(), nullable=True),
        *timestamps(),
    )
    op.create_index("ix_reports_city", "reports", ["city"])
    op.create_index("ix_reports_status", "reports", ["status"])
    op.create_index("ix_reports_occurred_at", "reports", ["occurred_at"])
    op.create_index("ix_reports_parent_report_id", "reports", ["parent_report_id"])
    op.create_index("ix_reports_lat_lng", "reports", ["lat", "lng"])

    op.create_table(
        "businesses",
        uuid_pk(),
        sa.Column("owner_user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("address_text", sa.String(length=255), nullable=True),
        sa.Column("lat", sa.Numeric(precision=9, scale=6), nullable=False),
        sa.Column("lng", sa.Numeric(precision=9, scale=6), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="BORRADOR"),
        sa.Column("reputation_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("sponsor_label", sa.String(length=80), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejected_reason", sa.Text(), nullable=True),
        *timestamps(),
    )
    op.create_index("ix_businesses_status", "businesses", ["status"])
    op.create_index("ix_businesses_lat_lng", "businesses", ["lat", "lng"])

    op.create_table(
        "report_votes",
        uuid_pk(),
        sa.Column("report_id", sa.String(length=36), sa.ForeignKey("reports.id"), nullable=False),
        sa.Column("voter_user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("vote_value", sa.String(length=40), nullable=False),
        sa.Column("weight_snapshot", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("reason", sa.Text(), nullable=True),
        *timestamps(),
        sa.UniqueConstraint("report_id", "voter_user_id", name="uq_report_vote_once"),
    )
    op.create_index("ix_report_votes_report_id", "report_votes", ["report_id"])

    op.create_table(
        "business_votes",
        uuid_pk(),
        sa.Column("business_id", sa.String(length=36), sa.ForeignKey("businesses.id"), nullable=False),
        sa.Column("voter_user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("vote_value", sa.String(length=40), nullable=False),
        sa.Column("weight_snapshot", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("reason", sa.Text(), nullable=True),
        *timestamps(),
        sa.UniqueConstraint("business_id", "voter_user_id", name="uq_business_vote_once"),
    )
    op.create_index("ix_business_votes_business_id", "business_votes", ["business_id"])

    op.create_table(
        "report_sources",
        uuid_pk(),
        sa.Column("report_id", sa.String(length=36), sa.ForeignKey("reports.id"), nullable=False),
        sa.Column("submitted_by_user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("url", sa.String(length=1000), nullable=False),
        sa.Column("source_domain", sa.String(length=255), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("extracted_text_hash", sa.String(length=128), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="PENDIENTE"),
        sa.Column("match_score", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        *timestamps(),
        sa.UniqueConstraint("report_id", "url", name="uq_report_source_url"),
    )
    op.create_index("ix_report_sources_report_id", "report_sources", ["report_id"])
    op.create_index("ix_report_sources_status", "report_sources", ["status"])


def downgrade() -> None:
    op.drop_table("report_sources")
    op.drop_table("business_votes")
    op.drop_table("report_votes")
    op.drop_table("businesses")
    op.drop_table("reports")
    op.drop_table("users")
