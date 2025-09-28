from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, List

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
    global _event_seq
    title = params.get("title", "Untitled")
    start_str = params.get("start") or datetime.utcnow().isoformat()
    duration_min = int(params.get("duration_min", 30))
    location = params.get("location")
    try:
        start = datetime.fromisoformat(start_str)
    except Exception:
        start = datetime.utcnow()
    end = start + timedelta(minutes=duration_min)
    ev = {
        "id": _event_seq,
        "title": title,
        "start": start.isoformat(),
        "end": end.isoformat(),
        "location": location,
    }
    _EVENTS.append(ev)
    _event_seq += 1
    return ev


def tool_calendar_find(params: Dict[str, Any]) -> List[Dict[str, Any]]:
    date_str = params.get("date")
    range_days = int(params.get("range_days", 1))
    if not date_str:
        return list(_EVENTS)
    try:
        base = datetime.fromisoformat(date_str)
    except Exception:
        base = datetime.utcnow()
    end = base + timedelta(days=range_days)
    return [e for e in _EVENTS if base <= datetime.fromisoformat(e["start"]) <= end]


TOOLS = {
    "flashcards.generate": tool_flashcards_generate,
    "flashcards.from_image": tool_flashcards_from_image,
    "tasks.create": tool_tasks_create,
    "tasks.list": tool_tasks_list,
    "calendar.add": tool_calendar_add,
    "calendar.find": tool_calendar_find,
}
