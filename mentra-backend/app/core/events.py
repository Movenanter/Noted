from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, Set
from uuid import uuid4


class EventBus:
    def __init__(self) -> None:
        self._subscribers: Set[asyncio.Queue] = set()
        self._lock = asyncio.Lock()

    async def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        async with self._lock:
            self._subscribers.add(q)
        return q

    async def unsubscribe(self, q: asyncio.Queue) -> None:
        async with self._lock:
            self._subscribers.discard(q)

    async def broadcast(self, event: Dict[str, Any]) -> None:
        # Fan out to all subscribers; don't block on slow consumers
        async with self._lock:
            subs = list(self._subscribers)
        for q in subs:
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                # Drop if overwhelmed
                pass


event_bus = EventBus()


def build_event(event_type: str, session_id: str | None = None, message: str | None = None, data: Dict[str, Any] | None = None) -> Dict[str, Any]:
    return {
        "event_id": str(uuid4()),
        "event_type": event_type,
        "session_id": session_id,
        "message": message,
        "data": data or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
