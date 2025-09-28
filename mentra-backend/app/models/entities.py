from sqlalchemy import Integer, String, Float, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db.base import Base


class Session(Base):
    __tablename__ = "sessions"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    summary_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    chunks: Mapped[list["TranscriptChunk"]] = relationship("TranscriptChunk", back_populates="session", cascade="all, delete-orphan")
    assets: Mapped[list["Asset"]] = relationship("Asset", back_populates="session", cascade="all, delete-orphan")
    flashcards: Mapped[list["Flashcard"]] = relationship("Flashcard", back_populates="session", cascade="all, delete-orphan")


class TranscriptChunk(Base):
    __tablename__ = "transcript_chunks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text)
    ts_start: Mapped[float] = mapped_column(Float)
    ts_end: Mapped[float] = mapped_column(Float)
    bookmarked: Mapped[bool] = mapped_column(Boolean, default=False)
    tags: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    session: Mapped[Session] = relationship("Session", back_populates="chunks")


class Asset(Base):
    __tablename__ = "assets"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    path: Mapped[str] = mapped_column(String(500))
    kind: Mapped[str] = mapped_column(String(50), default="image")

    session: Mapped[Session] = relationship("Session", back_populates="assets")


class Flashcard(Base):
    __tablename__ = "flashcards"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(10))  # qa | cloze | mc
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)  # store JSON as string for mc
    source_ts: Mapped[float | None] = mapped_column(Float, nullable=True)
    chunk_ids: Mapped[list[int] | None] = mapped_column(JSON, nullable=True)

    session: Mapped[Session] = relationship("Session", back_populates="flashcards")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    score: Mapped[float] = mapped_column(Float, default=0.0)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
