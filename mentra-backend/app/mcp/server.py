from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

# Ensure the project root (the parent directory that contains the 'app' package)
# is on sys.path when this file is executed directly by tooling (e.g., `mcp dev`).
# This allows absolute imports like `from app.services import llm_service` to work
# even if the module isn't imported as part of the `app.*` package.
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_THIS_DIR, os.pardir, os.pardir))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from app.services import llm_service


# In-memory stores for demo/tests
_TASKS: List[Dict[str, Any]] = []
_EVENTS: List[Dict[str, Any]] = []
_task_seq = 1
_event_seq = 1


def _flatten_flashcards(cards: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for t, items in cards.items():
        if not isinstance(items, list):
            continue
        for it in items:
            d = {"type": t}
            d.update(it)
            out.append(d)
    return out


def tool_flashcards_generate(params: Dict[str, Any]) -> List[Dict[str, Any]]:
    text = params.get("transcript_text", "")
    types = params.get("types", ["qa", "cloze", "mc"]) or []
    max_per_type = int(params.get("max_per_type", 3))
    cards = llm_service.generate_flashcards(text, types, max_per_type)
    return _flatten_flashcards(cards)


def tool_flashcards_from_image(params: Dict[str, Any]) -> List[Dict[str, Any]]:
    image_url = params.get("image_url") or ""
    types = params.get("types", ["qa"]) or []
    max_per_type = int(params.get("max_per_type", 1))
    cards = llm_service.generate_from_image(str(image_url), types, max_per_type)
    return _flatten_flashcards(cards)


def tool_tasks_create(params: Dict[str, Any]) -> Dict[str, Any]:
    global _task_seq
    task = {
        "id": _task_seq,
        "title": params.get("title", "Untitled"),
        "assignee": params.get("assignee"),
        "status": params.get("status", "open"),
        "due": params.get("due"),
    }
    _TASKS.append(task)
    _task_seq += 1
    return task


def tool_tasks_list(params: Dict[str, Any]) -> List[Dict[str, Any]]:
    status = params.get("status")
    if status:
        return [t for t in _TASKS if t.get("status") == status]
    return list(_TASKS)


def tool_calendar_add(params: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a calendar event into SQLite, fallback to memory if DB unavailable."""
    import json
    from uuid import uuid4
    from dateutil import parser as dateparser  # type: ignore
    try:
        from app.db.session import get_session
        from app.models.entities import CalendarEvent
        use_db = True
    except Exception:
        use_db = False

    title = str(params.get("title", "Untitled")).strip()
    start_str = str(params.get("start") or "").strip()
    duration_min = int(params.get("duration_min", 30))
    location = params.get("location")
    description = params.get("description")
    tags = params.get("tags")

    if not start_str:
        start = datetime.now(timezone.utc)
    else:
        try:
            start = dateparser.isoparse(start_str)
        except Exception:
            start = datetime.now(timezone.utc)

    if use_db:
        with get_session() as db:
            ev = CalendarEvent(
                title=title,
                start=start,
                duration_min=duration_min,
                location=str(location) if location else None,
                description=str(description) if description else None,
                tags_json=json.dumps(tags) if tags is not None else None,
            )
            db.add(ev)
            db.commit()
            return {
                "status": "success",
                "event_id": ev.id,
                # compatibility fields for existing tests/clients
                "title": ev.title,
                "start": ev.start.isoformat(),
                "duration_min": ev.duration_min,
                "location": ev.location,
                "description": ev.description,
            }
    else:
        # Fallback in-memory
        global _event_seq
        end = start + timedelta(minutes=duration_min)
        eid = str(uuid4())
        ev = {
            "id": eid,
            "title": title,
            "start": start.isoformat(),
            "end": end.isoformat(),
            "location": location,
            "description": description,
            "tags": tags,
        }
        _EVENTS.append(ev)
        _event_seq += 1
        return {
            "status": "success",
            "event_id": eid,
            # compatibility fields
            "title": title,
            "start": start.isoformat(),
            "duration_min": duration_min,
            "location": location,
            "description": description,
        }


def tool_calendar_find(params: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Find events with backward-compatible parameters and return a list.
    Supports both legacy {date, range_days} and new {query, start, end} styles.
    """
    import json
    try:
        from app.db.session import get_session
        from app.models.entities import CalendarEvent
        use_db = True
    except Exception:
        use_db = False

    # Accept both legacy and new parameter names
    q = (params.get("query") or "").strip().lower()
    start_str = params.get("start") or params.get("date")
    end_str = params.get("end")
    range_days = params.get("range_days")
    s_dt = datetime.min.replace(tzinfo=timezone.utc)
    e_dt = datetime.max.replace(tzinfo=timezone.utc)
    from dateutil import parser as dateparser  # type: ignore
    if start_str:
        try:
            s_dt = dateparser.isoparse(start_str)
        except Exception:
            pass
    if end_str:
        try:
            e_dt = dateparser.isoparse(end_str)
        except Exception:
            pass
    elif start_str and range_days:
        try:
            s_tmp = dateparser.isoparse(start_str)
            e_dt = s_tmp + timedelta(days=int(range_days))
        except Exception:
            pass

    out: List[Dict[str, Any]] = []
    if use_db:
        with get_session() as db:
            rows = db.query(CalendarEvent).all()
            for r in rows:
                if not (s_dt <= r.start <= e_dt):
                    continue
                if q and q not in (r.title or "").lower() and q not in (r.description or "").lower():
                    continue
                out.append({
                    "id": r.id,
                    "title": r.title,
                    "start": r.start.isoformat(),
                    "duration_min": r.duration_min,
                    "location": r.location,
                    "description": r.description,
                    "tags": json.loads(r.tags_json) if r.tags_json else None,
                })
    else:
        for e in _EVENTS:
            try:
                es = datetime.fromisoformat(e["start"]).astimezone(timezone.utc)
            except Exception:
                continue
            if not (s_dt <= es <= e_dt):
                continue
            if q and q not in (e.get("title",""))+ (e.get("description","")):
                continue
            out.append(e)
    return out


TOOLS = {
    "flashcards.generate": tool_flashcards_generate,
    "flashcards.from_image": tool_flashcards_from_image,
    "tasks.create": tool_tasks_create,
    "tasks.list": tool_tasks_list,
    "calendar.add": tool_calendar_add,
    "calendar.find": tool_calendar_find,
}

# Optional FastMCP integration for `mcp dev` CLI compatibility.
# Use the FastMCP class from the mcp package so the CLI recognizes it.
try:
    from mcp.server.fastmcp import FastMCP

    server = FastMCP("mentra-mcp")

    @server.tool(name="flashcards.generate")
    def _fmcp_flashcards_generate(
        transcript_text: str = "",
        types: List[str] | None = None,
        max_per_type: int = 3,
    ) -> List[Dict[str, Any]]:
        return tool_flashcards_generate({
            "transcript_text": transcript_text,
            "types": types or ["qa", "cloze", "mc"],
            "max_per_type": max_per_type,
        })

    @server.tool(name="flashcards.from_image")
    def _fmcp_flashcards_from_image(
        image_url: str,
        types: List[str] | None = None,
        max_per_type: int = 1,
    ) -> List[Dict[str, Any]]:
        return tool_flashcards_from_image({
            "image_url": image_url,
            "types": types or ["qa"],
            "max_per_type": max_per_type,
        })

    @server.tool(name="tasks.create")
    def _fmcp_tasks_create(
        title: str,
        assignee: str | None = None,
        status: str = "open",
        due: str | None = None,
    ) -> Dict[str, Any]:
        return tool_tasks_create({
            "title": title,
            "assignee": assignee,
            "status": status,
            "due": due,
        })

    @server.tool(name="tasks.list")
    def _fmcp_tasks_list(status: str | None = None) -> List[Dict[str, Any]]:
        return tool_tasks_list({"status": status} if status else {})

    @server.tool(name="calendar.add")
    def _fmcp_calendar_add(
        title: str,
        start: str,
        duration_min: int = 30,
        location: str | None = None,
    ) -> Dict[str, Any]:
        return tool_calendar_add({
            "title": title,
            "start": start,
            "duration_min": duration_min,
            "location": location,
        })

    @server.tool(name="calendar.find")
    def _fmcp_calendar_find(
        query: str | None = None,
        start: str | None = None,
        end: str | None = None,
    ) -> List[Dict[str, Any]]:
        return tool_calendar_find({
            "query": query,
            "start": start,
            "end": end,
        })

except Exception:
    # fastmcp not installed; skip exposing `server`. Tests use TOOLS directly.
    server = None  # type: ignore

if __name__ == "__main__" and server is not None:
    # Allow `python -m app.mcp.server` to run a stdio server when fastmcp is present.
    server.run()
