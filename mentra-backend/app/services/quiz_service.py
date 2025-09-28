from uuid import uuid4
from typing import Any, List, cast, Dict
import json
import random
from sqlalchemy.orm import Session
from ..models.entities import Flashcard, QuizAttempt


def start_quiz(db: Session, session_id: str, n: int = 5):
    pool = db.query(Flashcard).filter(Flashcard.session_id == session_id, Flashcard.type.in_(["qa", "mc"]))
    cards = pool.all()
    if not cards:
        return {"attempt_id": str(uuid4()), "questions": []}
    sample = random.sample(cards, k=min(n, len(cards)))
    questions = []
    for c in sample:
        c_type = cast(str, c.type)
        if c_type == "qa":
            questions.append({"id": cast(str, c.id), "type": "qa", "question": cast(str, c.question)})
        else:
            # answer stored as string; assume json-like choices encoded when created via LLM
            questions.append({
                "id": cast(str, c.id),
                "type": "mc",
                "question": cast(str, c.question),
                "answer": cast(Any, c.answer),
            })

    attempt = QuizAttempt(id=str(uuid4()), session_id=session_id, questions_json=questions, score=None)
    db.add(attempt)
    return {"attempt_id": attempt.id, "questions": questions}


def submit_quiz(db: Session, attempt_id: str, answers: Any):
    attempt: QuizAttempt | None = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if attempt is None:
        return 0.0
    questions_list = cast(List[Dict[str, Any]], attempt.questions_json or [])
    q_by_id = {str(q.get("id")): q for q in questions_list}
    correct = 0
    total = len(q_by_id)
    if total == 0:
        score = 0.0
    else:
        for qid, user_ans in (answers or {}).items():
            q = q_by_id.get(str(qid))
            if not q:
                continue
            fc = db.query(Flashcard).filter(Flashcard.id == str(qid)).first()
            if not fc:
                continue
            if q.get("type") == "qa":
                # naive contains or equality match
                fc_answer = cast(str, fc.answer)
                if isinstance(user_ans, str) and user_ans.strip().lower() in fc_answer.strip().lower():
                    correct += 1
            elif q.get("type") == "mc":
                try:
                    raw_answer = cast(Any, fc.answer)
                    data = json.loads(raw_answer) if isinstance(raw_answer, str) else raw_answer
                    correct_ans = (data or {}).get("correct")
                    if user_ans == correct_ans:
                        correct += 1
                except Exception:
                    pass
        score = float(correct) / float(total) if total else 0.0
    # Avoid Pylance complaining about assigning to ORM mapped attribute types
    setattr(attempt, "score", float(score))
    return float(score)
