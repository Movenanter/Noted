from typing import List, Optional, Sequence, cast as _cast
from sqlalchemy.orm import Session
from uuid import uuid4
from ..models.entities import Flashcard, Session as SessionModel, TranscriptChunk
import json as _json
from . import llm_service


def get_session_transcript(db: Session, session_id: str) -> str:
    chunks = (
        db.query(TranscriptChunk)
        .filter(TranscriptChunk.session_id == session_id)
        .order_by(TranscriptChunk.ts_start.asc())
        .all()
    )
    # Ensure we join actual strings to satisfy type checkers
    texts = [str(getattr(c, "text", "")) for c in chunks]
    return "\n".join(texts)


def create_flashcards_for_session(db: Session, session_id: str, types: Sequence[llm_service.FlashcardType], max_per_type: int):
    transcript = get_session_transcript(db, session_id)
    if not transcript.strip():
        return {"qa": [], "cloze": [], "mc": []}

    # Normalize and cast types to the LLM service's expected Literal union
    allowed = [t for t in types if t in ("qa", "cloze", "mc")]
    data = llm_service.generate_flashcards(
        transcript, _cast(List[llm_service.FlashcardType], allowed), max_per_type
    )
    created = {"qa": [], "cloze": [], "mc": []}
    for t, items in data.items():
        for item in items:
            # Ensure answers that are objects (e.g., MC choices) are stored as JSON
            answer_val = item.get("answer")
            if isinstance(answer_val, str):
                stored_answer = answer_val
            else:
                try:
                    stored_answer = _json.dumps(answer_val)
                except Exception:
                    stored_answer = str(answer_val)

            fc = Flashcard(
                id=str(uuid4()),
                session_id=session_id,
                type=t,
                question=item.get("question", "").strip(),
                answer=stored_answer,
                source_ts=item.get("source_ts"),
            )
            db.add(fc)
            created[t].append({
                "id": fc.id,
                "type": t,
                "question": fc.question,
                "answer": fc.answer,
                "source_ts": fc.source_ts,
            })
    return created


def list_flashcards(db: Session, session_id: str, type_filter: Optional[str] = None):
    q = db.query(Flashcard).filter(Flashcard.session_id == session_id)
    if type_filter:
        q = q.filter(Flashcard.type == type_filter)
    rows = q.order_by(Flashcard.created_at.asc()).all()
    return [
        {
            "id": r.id,
            "type": r.type,
            "question": r.question,
            "answer": r.answer,
            "source_ts": r.source_ts,
        }
        for r in rows
    ]
