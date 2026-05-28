"""enable_rls_and_fix_duplicate_index

Revision ID: 5a7cca080834
Revises: 78be058b7b91
Create Date: 2026-05-28 04:41:58.434000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '5a7cca080834'
down_revision: Union[str, None] = '78be058b7b91'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == 'postgresql':
        # 1. Drop duplicate unique index on users table
        op.execute("DROP INDEX IF EXISTS ix_users_email;")
        
        # 2. Enable Row Level Security (RLS) on all public schema tables
        op.execute("ALTER TABLE alembic_version ENABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE users ENABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE reports ENABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE business_votes ENABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE report_sources ENABLE ROW LEVEL SECURITY;")
    else:
        # For local dev SQLite, just run drop index if index exists, to ensure sync
        # Note: SQLite will automatically handle its constraints
        pass


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == 'postgresql':
        # Re-create unique index on users table
        op.create_index('ix_users_email', 'users', ['email'], unique=True)
        
        # Disable Row Level Security (RLS)
        op.execute("ALTER TABLE alembic_version DISABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE users DISABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE reports DISABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE report_votes DISABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE business_votes DISABLE ROW LEVEL SECURITY;")
        op.execute("ALTER TABLE report_sources DISABLE ROW LEVEL SECURITY;")
    else:
        pass


