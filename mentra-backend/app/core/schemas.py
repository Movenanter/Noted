from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Any, Sequence


class HealthOut(BaseModel):
    status: str = "ok"


class CreateSessionIn(BaseModel):
    title: str
    user_id: Optional[str] = None


class SessionOut(BaseModel):
    id: str
    title: str
    is_active: bool


class WebhookChunk(BaseModel):
    text: str
    ts_start: float
    ts_end: float
    bookmarked: bool = False


class WebhookIn(BaseModel):
    session_id: str
    chunks: List[WebhookChunk]


FlashcardType = Literal["qa", "cloze", "mc"]


class GenerateFlashcardsIn(BaseModel):
    types: List[FlashcardType] = Field(default_factory=lambda: ["qa"]) 
    max_per_type: int = 5


class FlashcardOut(BaseModel):
    id: str
    type: FlashcardType
    question: str
    answer: str
    source_ts: Optional[float] = None


class ExplainIn(BaseModel):
    mode: Literal["eli5", "technical", "analogy"]
    topic: Optional[str] = None


class QuizStartOut(BaseModel):
    attempt_id: str
    questions: Any


class QuizSubmitIn(BaseModel):
    attempt_id: str
    answers: Any


class QuizSubmitOut(BaseModel):
    score: float
