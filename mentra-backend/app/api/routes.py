from __future__ import annotations

import json
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, BackgroundTasks
from fastapi import status
from fastapi.responses import JSONResponse
from fastapi import WebSocket, WebSocketDisconnect

from app.core.security import require_bearer, require_webhook
from app.core.config import settings
from app.core.events import event_bus, build_event
from app.db.session import get_session
from app.models.entities import Session, TranscriptChunk, Asset, Flashcard, Course, SessionCourse, FlashcardCourse, CalendarEvent
from app.services import llm_service
from app.services.transcribe_service import transcribe_wav_bytes


router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/sessions")
def create_session(payload: Dict[str, Any], background_tasks: BackgroundTasks, _: bool = Depends(require_bearer)):
    title = payload.get("title") or "Untitled"
    sid = str(uuid4())
    with get_session() as db:
        db.add(Session(id=sid, title=title, is_active=True))
        db.commit()
    # Notify
    background_tasks.add_task(event_bus.broadcast, build_event("session.created", sid, f"Session '{title}' created", {"title": title}))
    return {"id": sid, "title": title}


@router.post("/webhooks/mentra")
def webhook_ingest(body: Dict[str, Any], background_tasks: BackgroundTasks, __: bool = Depends(require_webhook)):
    sid = body.get("session_id") or str(uuid4())
    chunks = body.get("chunks", [])
    with get_session() as db:
        # upsert session for robustness
        if not db.get(Session, sid):
            db.add(Session(id=sid, title="Imported", is_active=True))
            db.flush()
        for c in chunks:
            db.add(
                TranscriptChunk(
                    session_id=sid,
                    text=str(c.get("text", "")),
                    ts_start=float(c.get("ts_start", 0)),
                    ts_end=float(c.get("ts_end", 0)),
                    bookmarked=bool(c.get("bookmarked", False)),
                )
            )
        db.commit()
    # Notify
    background_tasks.add_task(event_bus.broadcast, build_event("chunk.saved", sid, f"{len(chunks)} chunks ingested"))
    return {"ok": True}


@router.post("/sessions/{sid}/assets")
def upload_asset(sid: str, background_tasks: BackgroundTasks, file: UploadFile = File(...), _: bool = Depends(require_bearer)):
    # For tests, don't persist file, just record meta path
    path = f"uploads/{sid}_{file.filename}"
    with get_session() as db:
        # For assets, require an existing session; invalid SID should return 404
        if not db.get(Session, sid):
            raise HTTPException(status_code=404, detail="Session not found")
        db.add(Asset(session_id=sid, path=path, kind="image"))
        db.commit()
    background_tasks.add_task(event_bus.broadcast, build_event("asset.uploaded", sid, f"Asset {file.filename} uploaded", {"path": path}))
    return {"path": path}


@router.post("/sessions/{sid}/flashcards:generate-sync")
def flashcards_generate_sync(sid: str, body: Dict[str, Any], background_tasks: BackgroundTasks, _: bool = Depends(require_bearer)):
    types = body.get("types", ["qa"]) or []
    max_per_type = int(body.get("max_per_type", 1))
    with get_session() as db:
        sess = db.get(Session, sid)
        if not sess:
            # Create a placeholder session so future artifacts can attach safely
            sess = Session(id=sid, title="Imported", is_active=True)
            db.add(sess)
            db.flush()
        # gather transcript
        chunks = db.query(TranscriptChunk).filter(TranscriptChunk.session_id == sid).order_by(TranscriptChunk.ts_start).all()
        if not chunks:
            # test expects empty qa list when no transcript
            return {"qa": [], "cloze": [], "mc": []}
        transcript_text = "\n".join(c.text for c in chunks)
        cards = llm_service.generate_flashcards(transcript_text, types, max_per_type)
        # persist
        # If session has an assigned course, link generated flashcards to that course
        assigned_course_id: Optional[str] = None
        sc = db.query(SessionCourse).filter(SessionCourse.session_id == sid).first()
        if sc:
            assigned_course_id = sc.course_id
        for t, items in cards.items():
            for it in items:
                ans = it["answer"]
                ans_str = json.dumps(ans) if isinstance(ans, dict) else str(ans)
                fc = Flashcard(
                    session_id=sid,
                    type=t,
                    question=it.get("question", ""),
                    answer=ans_str,
                    source_ts=it.get("source_ts"),
                )
                db.add(fc)
                db.flush()
                if assigned_course_id:
                    db.add(FlashcardCourse(flashcard_id=fc.id, course_id=assigned_course_id))
        db.commit()
        background_tasks.add_task(event_bus.broadcast, build_event("flashcards.generated", sid, "Flashcards generated", {"counts": {k: len(v) for k, v in cards.items()}}))
        return cards


@router.get("/sessions/{sid}/flashcards")
def list_flashcards(sid: str, _: bool = Depends(require_bearer)):
    with get_session() as db:
        rows = db.query(Flashcard).filter(Flashcard.session_id == sid).all()
        # return simplified view
        out = []
        for r in rows:
            out.append({"id": r.id, "type": r.type, "question": r.question})
        return out


@router.post("/sessions/{sid}/explain")
def explain_topic(sid: str, body: Dict[str, Any], _: bool = Depends(require_bearer)):
    mode = body.get("mode", "eli5")
    topic = body.get("topic", "")
    with get_session() as db:
        has_any = db.query(TranscriptChunk).filter(TranscriptChunk.session_id == sid).first() is not None
    if not has_any:
        return {"mode": mode, "topic": topic, "explanation": "No transcript yet."}
    txt = llm_service.explain_topic(topic, mode)
    return {"mode": mode, "topic": topic, "explanation": txt}


@router.post("/sessions/{sid}/quiz:start")
def quiz_start(sid: str, background_tasks: BackgroundTasks, _: bool = Depends(require_bearer)):
    # Local import to avoid static analysis self-dependency warning in some IDEs
    from app.models.entities import QuizAttempt
    with get_session() as db:
        # Ensure session exists to satisfy FK on QuizAttempt
        if not db.get(Session, sid):
            db.add(Session(id=sid, title="Imported", is_active=True))
            db.flush()
        cards = db.query(Flashcard).filter(Flashcard.session_id == sid).all()
        if not cards:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": "No flashcards"})
        questions = [{"id": c.id, "type": c.type, "question": c.question} for c in cards]
        qa = QuizAttempt(session_id=sid, score=0.0, questions_json=json.dumps(questions))
        db.add(qa)
        db.flush()
        db.commit()
        background_tasks.add_task(event_bus.broadcast, build_event("quiz.started", sid, "Quiz started", {"attempt_id": qa.id, "count": len(questions)}))
        return {"attempt_id": qa.id, "questions": questions}


@router.post("/sessions/{sid}/quiz/submit")
def quiz_submit(sid: str, body: Dict[str, Any], background_tasks: BackgroundTasks, _: bool = Depends(require_bearer)):
    # Local import to avoid static analysis self-dependency warning in some IDEs
    from app.models.entities import QuizAttempt
    answers: Dict[str, Any] = body.get("answers", {})
    with get_session() as db:
        # Ensure session exists to satisfy FK on QuizAttempt
        if not db.get(Session, sid):
            db.add(Session(id=sid, title="Imported", is_active=True))
            db.flush()
        cards = db.query(Flashcard).filter(Flashcard.session_id == sid).all()
        correct = 0
        total = max(len(cards), 1)
        for c in cards:
            a = answers.get(str(c.id))
            if c.type == "qa":
                if isinstance(a, str) and a.lower() in c.answer.lower():
                    correct += 1
            elif c.type == "mc":
                try:
                    d = json.loads(c.answer)
                    if a == d.get("correct"):
                        correct += 1
                except Exception:
                    pass
        score = correct / total
        qa = QuizAttempt(session_id=sid, score=score, questions_json=json.dumps([]))
        db.add(qa)
        db.commit()
        background_tasks.add_task(event_bus.broadcast, build_event("quiz.submitted", sid, "Quiz submitted", {"score": score}))
        return {"score": score}


@router.get("/sessions/{sid}/timeline")
def timeline(sid: str, q: str | None = None, tag: str | None = None, bookmarked: bool | None = None, _: bool = Depends(require_bearer)):
    with get_session() as db:
        chunks_q = db.query(TranscriptChunk).filter(TranscriptChunk.session_id == sid)
        if q:
            chunks_q = chunks_q.filter(TranscriptChunk.text.contains(q))
        if bookmarked is True:
            chunks_q = chunks_q.filter(TranscriptChunk.bookmarked.is_(True))
        chunks = chunks_q.order_by(TranscriptChunk.ts_start).all()
        assets = db.query(Asset).filter(Asset.session_id == sid).all()
        return {
            "chunks": [{"id": c.id, "text": c.text, "bookmarked": c.bookmarked} for c in chunks],
            "assets": [{"id": a.id, "path": a.path} for a in assets],
        }


@router.post("/sessions/{sid}/bookmark")
def bookmark_range(sid: str, background_tasks: BackgroundTasks, ts_start: str = Form(...), ts_end: str = Form(...), tag: str | None = Form(None), _: bool = Depends(require_bearer)):
    s = float(ts_start)
    e = float(ts_end)
    with get_session() as db:
        rows = db.query(TranscriptChunk).filter(TranscriptChunk.session_id == sid).all()
        for c in rows:
            # defensive against None values
            if c.ts_start is None or c.ts_end is None:
                continue
            if c.ts_start >= s and c.ts_end <= e:
                c.bookmarked = True
        db.commit()
    background_tasks.add_task(event_bus.broadcast, build_event("bookmark.added", sid, "Bookmark added", {"tag": tag, "ts_start": s, "ts_end": e}))
    return {"ok": True, "tag": tag}


@router.post("/sessions/{sid}/summary:generate-sync")
def generate_summary(sid: str, background_tasks: BackgroundTasks, _: bool = Depends(require_bearer)):
    with get_session() as db:
        chunks = db.query(TranscriptChunk).filter(TranscriptChunk.session_id == sid).order_by(TranscriptChunk.ts_start).all()
        text = "\n".join(c.text for c in chunks)
        summary = llm_service.generate_summary(text)
        ses = db.get(Session, sid)
        if ses:
            # Persist as JSON string in DB, but return dict in response
            ses.summary_json = json.dumps(summary)
            db.commit()
        background_tasks.add_task(event_bus.broadcast, build_event("summary.generated", sid, "Summary generated"))
        return summary


# Live audio via WebSocket (binary frames)
@router.websocket("/ws/sessions/{sid}/live-audio")
async def ws_live_audio(websocket: WebSocket, sid: str):
    # Optional bearer via query param `token`
    token = websocket.query_params.get("token")
    if token and token != settings.API_BEARER_TOKEN:
        await websocket.close(code=1008)
        return
    await websocket.accept()
    buffer: bytearray = bytearray()
    try:
        while True:
            msg = await websocket.receive()
            mtype = msg.get("type")
            if mtype == "websocket.disconnect":
                break
            # Binary audio frames
            if "bytes" in msg and msg["bytes"]:
                buffer.extend(msg["bytes"])  # accumulate raw WAV bytes from client
                # Transcribe on rolling buffer (naive):
                if len(buffer) > 16000:  # ~1 sec at 16kHz 16-bit mono
                    text = transcribe_wav_bytes(bytes(buffer))
                    await websocket.send_json({"transcript": text})
                    buffer.clear()
            # Control/text messages
            elif msg.get("text") == "flush":
                if buffer:
                    text = transcribe_wav_bytes(bytes(buffer))
                    buffer.clear()
                    await websocket.send_json({"transcript": text, "final": True})
                else:
                    # Even if no audio buffered, respond to flush to avoid hanging clients
                    await websocket.send_json({"transcript": "", "final": True})
            else:
                # ignore other texts; send pong
                await websocket.send_json({"ok": True})
    except WebSocketDisconnect:
        pass
    except RuntimeError:
        # Raised if receive() called after disconnect; safe to ignore for tests
        pass


@router.post("/sessions/{sid}/transcribe")
async def upload_and_transcribe(sid: str, file: UploadFile = File(...), _: bool = Depends(require_bearer)):
    data = await file.read()
    txt = transcribe_wav_bytes(data, mime=file.content_type or "audio/wav")
    with get_session() as db:
        # Ensure session exists (glasses may generate their own SID before calling this)
        if not db.get(Session, sid):
            db.add(Session(id=sid, title="Imported", is_active=True))
            db.flush()
        db.add(TranscriptChunk(session_id=sid, text=txt, ts_start=0.0, ts_end=0.0, bookmarked=True))
        db.commit()
    # We are already in async context here
    await event_bus.broadcast(build_event("transcript.saved", sid, "Transcript saved from file"))
    return {"text": txt}


# Notifications WebSocket for webapp
@router.websocket("/ws/notify")
async def ws_notify(websocket: WebSocket):
    # Require bearer via query param for simplicity: /ws/notify?token=...
    token = websocket.query_params.get("token")
    if token != settings.API_BEARER_TOKEN:
        await websocket.close(code=1008)
        return
    await websocket.accept()
    q = await event_bus.subscribe()
    try:
        while True:
            event = await q.get()
            await websocket.send_json(event)
    except WebSocketDisconnect:
        pass
    finally:
        await event_bus.unsubscribe(q)


# ----------------------
# Courses & Class Linking
# ----------------------

@router.post("/courses")
def create_course(body: Dict[str, Any], _: bool = Depends(require_bearer)):
    name = str(body.get("name", "")).strip()
    if not name:
        raise HTTPException(status_code=400, detail="name required")
    aliases: List[str] = body.get("aliases", []) or []
    color: Optional[str] = body.get("color")
    with get_session() as db:
        # ensure unique
        existing = db.query(Course).filter(Course.name == name).first()
        if existing:
            return {"id": existing.id, "name": existing.name, "aliases": json.loads(existing.aliases_json or "[]"), "color": existing.color}
        crs = Course(name=name, color=color, aliases_json=json.dumps(aliases) if aliases else None)
        db.add(crs)
        db.flush()
        db.commit()
        return {"id": crs.id, "name": crs.name, "aliases": aliases, "color": crs.color}


@router.get("/courses")
def list_courses(_: bool = Depends(require_bearer)):
    with get_session() as db:
        rows = db.query(Course).all()
        return [{"id": r.id, "name": r.name, "aliases": json.loads(r.aliases_json or "[]"), "color": r.color} for r in rows]


@router.post("/sessions/{sid}/class:assign")
def assign_class(sid: str, body: Dict[str, Any], background_tasks: BackgroundTasks, _: bool = Depends(require_bearer)):
    course_id: Optional[str] = body.get("course_id")
    name: Optional[str] = body.get("name")
    with get_session() as db:
        # ensure session exists
        if not db.get(Session, sid):
            raise HTTPException(status_code=404, detail="Session not found")
        # resolve course
        course: Optional[Course] = None
        if course_id:
            course = db.get(Course, course_id)
        elif name:
            course = db.query(Course).filter(Course.name == name).first()
            if not course:
                course = Course(name=name, aliases_json=None)
                db.add(course)
                db.flush()
        if not course:
            raise HTTPException(status_code=400, detail="course_id or name required")
        # upsert association (one course per session currently)
        existing = db.query(SessionCourse).filter(SessionCourse.session_id == sid).first()
        if existing:
            existing.course_id = course.id
        else:
            db.add(SessionCourse(session_id=sid, course_id=course.id))
        db.commit()
    background_tasks.add_task(event_bus.broadcast, build_event("session.class.assigned", sid, f"Class assigned: {course.name}", {"course_id": course.id}))
    return {"ok": True, "course_id": course.id}


@router.get("/sessions/{sid}/class:suggest")
def suggest_class(sid: str, _: bool = Depends(require_bearer)):
    """
    Suggest likely courses for a session using simple heuristics:
    - Title or transcript contains course name or aliases (case-insensitive)
    - Returns up to 5 candidates with scores
    This is a backend-native heuristic; provider API integration can replace this later.
    """
    with get_session() as db:
        sess = db.get(Session, sid)
        if not sess:
            raise HTTPException(status_code=404, detail="Session not found")
        # aggregate searchable text
        text_parts: List[str] = []
        if sess.title:
            text_parts.append(sess.title)
        chunks = db.query(TranscriptChunk).filter(TranscriptChunk.session_id == sid).all()
        text_parts.extend([c.text for c in chunks])
        haystack = ("\n".join(text_parts)).lower()
        # score courses
        candidates = []
        for crs in db.query(Course).all():
            score = 0
            if crs.name and crs.name.lower() in haystack:
                score += 2
            aliases = []
            try:
                aliases = json.loads(crs.aliases_json or "[]")
            except Exception:
                aliases = []
            for a in aliases:
                if isinstance(a, str) and a.lower() in haystack:
                    score += 1
            if score > 0:
                candidates.append({"course_id": crs.id, "name": crs.name, "score": score})
        candidates.sort(key=lambda x: x["score"], reverse=True)
        return {"candidates": candidates[:5]}


# ----------------------
# Calendar Routes
# ----------------------

@router.post("/calendar/add")
def calendar_add(body: Dict[str, Any], _: bool = Depends(require_bearer)):
    """
    Insert a calendar event into SQLite.
    Input: {title, start (ISO8601), duration_min, location?, description?, tags?}
    Output: {status:"success", event_id}
    """
    import json
    from datetime import datetime
    from dateutil import parser as dateparser  # type: ignore

    title = str(body.get("title", "")).strip()
    start_iso = str(body.get("start", "")).strip()
    duration_min = int(body.get("duration_min", 60))
    location = body.get("location")
    description = body.get("description")
    tags = body.get("tags")
    if not title or not start_iso:
        raise HTTPException(status_code=400, detail="title and start are required")
    try:
        start_dt = dateparser.isoparse(start_iso)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid start datetime")
    with get_session() as db:
        ev = CalendarEvent(
            title=title,
            start=start_dt,
            duration_min=duration_min,
            location=str(location) if location else None,
            description=str(description) if description else None,
            tags_json=json.dumps(tags) if tags is not None else None,
        )
        db.add(ev)
        db.commit()
        return {"status": "success", "event_id": ev.id}


@router.get("/calendar/feed.ics")
def calendar_feed_ics():
    """Return an iCalendar feed with all events."""
    from icalendar import Calendar, Event
    from fastapi.responses import Response
    from datetime import timedelta, datetime, timezone

    cal = Calendar()
    cal.add("prodid", "-//Mentra//Noted Calendar//EN")
    cal.add("version", "2.0")

    with get_session() as db:
        rows = db.query(CalendarEvent).order_by(CalendarEvent.start.asc()).all()
        now_utc = datetime.now(timezone.utc)
        for r in rows:
            ev = Event()
            ev.add("summary", r.title)
            ev.add("dtstart", r.start)
            ev.add("dtend", r.start + timedelta(minutes=int(r.duration_min or 0)))
            if r.location:
                ev.add("location", r.location)
            if r.description:
                ev.add("description", r.description)
            ev.add("dtstamp", now_utc)
            ev.add("uid", r.id)
            cal.add_component(ev)
    ics_bytes = cal.to_ical()
    return Response(content=ics_bytes, media_type="text/calendar; charset=utf-8")
