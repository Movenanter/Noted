"""full schema

Revision ID: 0002_full_schema
Revises: 0001_init
Create Date: 2025-09-28

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0002_full_schema"
down_revision: Union[str, None] = "0001_init"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sessions",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("summary_json", sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "transcript_chunks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.String(length=64), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("ts_start", sa.Float(), nullable=False),
        sa.Column("ts_end", sa.Float(), nullable=False),
        sa.Column("bookmarked", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_transcript_chunks_session_id"), "transcript_chunks", ["session_id"], unique=False)

    op.create_table(
        "assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.String(length=64), nullable=False),
        sa.Column("path", sa.String(length=500), nullable=False),
        sa.Column("kind", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_assets_session_id"), "assets", ["session_id"], unique=False)

    op.create_table(
        "flashcards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.String(length=64), nullable=False),
        sa.Column("type", sa.String(length=10), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("source_ts", sa.Float(), nullable=True),
        sa.Column("chunk_ids", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_flashcards_session_id"), "flashcards", ["session_id"], unique=False)

    op.create_table(
        "quiz_attempts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.String(length=64), nullable=False),
        sa.Column("score", sa.Float(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_quiz_attempts_session_id"), "quiz_attempts", ["session_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_quiz_attempts_session_id"), table_name="quiz_attempts")
    op.drop_table("quiz_attempts")
    op.drop_index(op.f("ix_flashcards_session_id"), table_name="flashcards")
    op.drop_table("flashcards")
    op.drop_index(op.f("ix_assets_session_id"), table_name="assets")
    op.drop_table("assets")
    op.drop_index(op.f("ix_transcript_chunks_session_id"), table_name="transcript_chunks")
    op.drop_table("transcript_chunks")
    op.drop_table("sessions")
