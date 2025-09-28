from __future__ import annotations

from uuid import uuid4
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..models.entities import Session as SessionModel


router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/sessions")
def create_session(db: Session = Depends(get_db)):
    sid = str(uuid4())
    s = SessionModel(id=sid)
    db.add(s)
    db.commit()
    return {"id": sid}


@router.get("/sessions")
def list_sessions(db: Session = Depends(get_db)):
    rows = db.query(SessionModel).order_by(SessionModel.created_at.desc()).all()
    return [{"id": r.id, "created_at": r.created_at.isoformat()} for r in rows]
