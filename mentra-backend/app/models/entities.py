from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import String, DateTime, Text, ForeignKey, Integer, Boolean, Float, UniqueConstraint
from sqlalchemy.sql import expression as sa_expr
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.base import Base


class Session(Base):
    __tablename__ = "session"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=sa_expr.text("1"))
    summary_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # relationships
    transcript_chunks = relationship("TranscriptChunk", back_populates="session", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="session", cascade="all, delete-orphan")
    # associations
    # session_course backref defined on SessionCourse


class TranscriptChunk(Base):
    __tablename__ = "transcript_chunk"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("session.id", ondelete="CASCADE"), nullable=False)
    ts_start: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ts_end: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    text: Mapped[str] = mapped_column(Text, nullable=False, default="")
    bookmarked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=sa_expr.text("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    session = relationship("Session", back_populates="transcript_chunks")


class Asset(Base):
    __tablename__ = "asset"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("session.id", ondelete="CASCADE"), nullable=False)
    kind: Mapped[str] = mapped_column(String, nullable=False)
    path: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    session = relationship("Session", back_populates="assets")


class Flashcard(Base):
    __tablename__ = "flashcard"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("session.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)  # qa | cloze | mc
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    source_ts: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    # associations: flashcard_course backref defined on FlashcardCourse


class QuizAttempt(Base):
    __tablename__ = "quiz_attempt"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("session.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    # Store questions as JSON-like Python structure; using Text for portability
    questions_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)


class User(Base):
    __tablename__ = "user"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)


class Course(Base):
    __tablename__ = "course"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    color: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    # Store aliases list as JSON string for portability
    aliases_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class SessionCourse(Base):
    __tablename__ = "session_course"
    __table_args__ = (UniqueConstraint("session_id", name="uix_session_course_session"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("session.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[str] = mapped_column(String, ForeignKey("course.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    session = relationship("Session", backref="session_course")
    course = relationship("Course")


class FlashcardCourse(Base):
    __tablename__ = "flashcard_course"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    flashcard_id: Mapped[str] = mapped_column(String, ForeignKey("flashcard.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[str] = mapped_column(String, ForeignKey("course.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    flashcard = relationship("Flashcard", backref="flashcard_course")
    course = relationship("Course")


# ----------------------
# Calendar Events
# ----------------------

class CalendarEvent(Base):
    __tablename__ = "calendar_event"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String, nullable=False)
    start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    duration_min: Mapped[int] = mapped_column(Integer, nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


# ----------------------
# AgentMail: Proposed items
# ----------------------

class ProposedCalendarItem(Base):
    __tablename__ = "proposed_calendar_item"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    # Source metadata
    source: Mapped[str] = mapped_column(String, nullable=False, default="email")  # email|nlp|other
    message_id: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)
    proposer: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # gemini|heuristic
    # Proposal fields
    kind: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # meeting|homework
    title: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    start: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    duration_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    professor_email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    course_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    raw: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # store JSON as string for portability
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending", index=True)  # pending|accepted|rejected
