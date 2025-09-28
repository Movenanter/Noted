from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from email import message_from_bytes, policy
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from icalendar import Calendar

from app.core.security import require_bearer
from app.core.config import settings
from app.core.events import event_bus, build_event
from app.db.session import get_session
from app.models.entities import ProposedCalendarItem, CalendarEvent


router = APIRouter()


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


@router.post("/email/inbound")
async def email_inbound(request: Request):
    """
    Ingest raw RFC822 email (webhook) and create a ProposedCalendarItem.
    Prefers ICS attachments; falls back to Gemini extractor if available.
    """
    raw = await request.body()
    # Verify HMAC signature if configured (env var overrides settings to support dynamic tests)
    import os
    secret = os.environ.get("AGENTMAIL_WEBHOOK_SECRET") or settings.AGENTMAIL_WEBHOOK_SECRET
    sig_hdr = request.headers.get("X-Agentmail-Signature") or request.headers.get("X-AgentMail-Signature")
    if secret:
        import hmac, hashlib
        if not sig_hdr:
            raise HTTPException(status_code=401, detail="Invalid signature")
        digest = hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(digest, sig_hdr.strip()):
            raise HTTPException(status_code=401, detail="Invalid signature")
    msg = message_from_bytes(raw, policy=policy.default)

    subject = (msg.get("Subject") or "").strip()
    from_addr = (msg.get("From") or "").strip()
    message_id = (msg.get("Message-ID") or str(uuid4())).strip()

    # Extract text body
    body = ""
    if msg.is_multipart():
        for p in msg.walk():
            if p.get_content_type() == "text/plain":
                try:
                    body += p.get_content()
                except Exception:
                    pass
    else:
        if msg.get_content_type() == "text/plain":
            try:
                body = msg.get_content()
            except Exception:
                body = ""

    extracted: Optional[dict] = None
    # Prefer ICS if present
    try:
        if msg.is_multipart():
            for p in msg.walk():
                if p.get_content_type() == "text/calendar":
                    cal = Calendar.from_ical(p.get_content())
                    for ev in cal.walk("VEVENT"):
                        s = ev.get("DTSTART").dt
                        e = ev.get("DTEND").dt
                        s = s if isinstance(s, datetime) else datetime.fromisoformat(str(s))
                        e = e if isinstance(e, datetime) else datetime.fromisoformat(str(e))
                        extracted = {
                            "type": "meeting",
                            "title": str(ev.get("SUMMARY") or subject),
                            "start": s.isoformat(),
                            "duration_min": int((e - s).total_seconds() // 60),
                            "location": str(ev.get("LOCATION") or ""),
                            "description": str(ev.get("DESCRIPTION") or ""),
                            "professor_hint": from_addr,
                            "confidence": 0.95,
                        }
                        break
    except Exception:
        extracted = None

    # Fallback to Gemini extraction if no ICS
    if not extracted:
        try:
            from app.services.email_extract import extract_from_email

            parsed = extract_from_email(subject, body)
            extracted = parsed if isinstance(parsed, dict) else None
        except Exception:
            extracted = None

    kind = (extracted or {}).get("type") or ("homework" if "due" in (subject + " " + body).lower() else "meeting")
    title = (extracted or {}).get("title") or subject[:140]
    start_iso = (extracted or {}).get("start")
    start_dt = datetime.fromisoformat(start_iso) if start_iso else None
    duration = (extracted or {}).get("duration_min")
    location = (extracted or {}).get("location") or ""
    description = (extracted or {}).get("description") or ""
    prof_email = (extracted or {}).get("professor_hint") or from_addr
    confidence = float((extracted or {}).get("confidence") or (0.9 if extracted else 0.5))

    with get_session() as db:
        # Deduplicate by message_id if already proposed
        exists = db.query(ProposedCalendarItem).filter(ProposedCalendarItem.message_id == message_id).first()
        if exists:
            return {"status": "duplicate", "proposal_id": exists.id}

        raw_json = json.dumps(extracted) if extracted is not None else json.dumps({"subject": subject})
        prop = ProposedCalendarItem(
            message_id=message_id,
            source="email",
            proposer="gemini" if extracted else "heuristic",
            kind=kind,
            title=title,
            start=start_dt,
            duration_min=duration,
            location=location,
            description=description,
            professor_email=prof_email,
            confidence=confidence,
            raw=raw_json,
            status="pending",
        )
        db.add(prop)
        db.commit()
        pid = prop.id

    # Notify listeners to ask for confirmation
    tts = f"Email from {prof_email or 'unknown'}. {'Meeting' if kind=='meeting' else 'Homework'} detected"
    if start_dt:
        tts += f" on {start_dt.strftime('%a %b %d at %I:%M %p')}"
    tts += ". Do you want me to add it to your calendar?"
    await event_bus.broadcast(build_event("proposal.created", None, None, {
        "proposal_id": pid,
        "kind": kind,
        "title": title,
        "start": start_dt.isoformat() if start_dt else None,
        "professor_email": prof_email,
        "confidence": confidence,
        "tts": tts,
    }))

    return {"status": "ok", "proposal_id": pid}


@router.get("/proposals")
def list_proposals(status: str = Query("pending"), __: bool = Depends(require_bearer)):
    with get_session() as db:
        rows = db.query(ProposedCalendarItem).filter(ProposedCalendarItem.status == status).order_by(ProposedCalendarItem.created_at.desc()).all()
        return [{
            "id": r.id,
            "kind": r.kind,
            "title": r.title,
            "start": r.start.isoformat() if r.start else None,
            "duration_min": r.duration_min,
            "location": r.location,
            "description": r.description,
            "professor_email": r.professor_email,
            "confidence": r.confidence,
            "status": r.status,
        } for r in rows]


@router.post("/proposals/{proposal_id}/confirm")
async def confirm_proposal(proposal_id: str, __: bool = Depends(require_bearer)):
    with get_session() as db:
        p = db.query(ProposedCalendarItem).filter(ProposedCalendarItem.id == proposal_id).first()
        if not p or p.status != "pending":
            raise HTTPException(status_code=404, detail="proposal not found")
        if not p.title or not p.start or not p.duration_min:
            raise HTTPException(status_code=400, detail="proposal missing required fields")

        ev = CalendarEvent(
            title=p.title,
            start=p.start,
            duration_min=int(p.duration_min),
            location=p.location or "",
            description=p.description or "",
            tags_json=json.dumps({"source": "agentmail", "proposal_id": p.id}),
        )
        db.add(ev)
        p.status = "accepted"
        db.commit()

    # Notify
    await event_bus.broadcast(build_event("proposal.confirmed", None, None, {"proposal_id": p.id, "event_id": ev.id, "title": p.title}))
    return {"status": "success", "event_id": ev.id}


@router.post("/proposals/{proposal_id}/reject")
async def reject_proposal(proposal_id: str, __: bool = Depends(require_bearer)):
    with get_session() as db:
        p = db.query(ProposedCalendarItem).filter(ProposedCalendarItem.id == proposal_id).first()
        if not p or p.status != "pending":
            raise HTTPException(status_code=404, detail="proposal not found")
        p.status = "rejected"
        db.commit()
    # Notify
    await event_bus.broadcast(build_event("proposal.rejected", None, None, {"proposal_id": p.id, "title": p.title}))
    return {"status": "success"}
