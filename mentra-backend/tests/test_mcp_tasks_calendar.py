from datetime import datetime, timedelta
from app.mcp import server as mcp


def test_mcp_tasks_create_and_list(monkeypatch):
    # Create a few tasks
    out1 = mcp.TOOLS["tasks.create"]({"title": "Write doc", "due": datetime.utcnow().isoformat(), "assignee": "me"})
    out2 = mcp.TOOLS["tasks.create"]({"title": "Review PR", "assignee": None, "due": None})
    assert out1["title"] == "Write doc"
    assert out2["status"] == "open"

    # List all
    lst = mcp.TOOLS["tasks.list"]({})
    assert isinstance(lst, list) and len(lst) >= 2

    # List filtered by status
    open_tasks = mcp.TOOLS["tasks.list"]({"status": "open"})
    assert all(t.get("status") == "open" for t in open_tasks)


def test_mcp_calendar_add_and_find():
    now = datetime.utcnow()
    ev = mcp.TOOLS["calendar.add"]({
        "title": "Standup",
        "start": now.isoformat(),
        "duration_min": 15,
        "location": "Zoom"
    })
    assert ev["title"] == "Standup"

    # Find within the day
    found = mcp.TOOLS["calendar.find"]({"date": now.isoformat(), "range_days": 1})
    assert any(e.get("title") == "Standup" for e in found)
