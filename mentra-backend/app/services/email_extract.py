import os
import json
from typing import Any, Dict

from app.core.config import settings

try:
    import google.generativeai as genai  # type: ignore
except Exception:  # pragma: no cover - optional at runtime
    genai = None


MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


SCHEMA_PROMPT = (
    "Return ONLY compact JSON with keys: "
    '{"type":"meeting|homework","title":str,"start":ISO8601?,'
    '"duration_min":int?,"location":str?,"description":str?,'
    '"course_hint":str?,"professor_hint":str?,"confidence":number?}'
)


def extract_from_email(subject: str, body: str) -> Dict[str, Any]:
    """Use Gemini to extract structured fields from an email.
    Falls back to a heuristic when DEV_FAKE_LLM is set or Gemini is unavailable.
    """
    if settings.DEV_FAKE_LLM or genai is None or not settings.GEMINI_API_KEY:
        # Heuristic fallback for dev/demo
        low = (subject + "\n" + body).lower()
        kind = "homework" if any(k in low for k in ["due", "deadline", "assignment"]) else "meeting"
        title = subject[:140] or ("Homework" if kind == "homework" else "Meeting")
        return {"type": kind, "title": title, "confidence": 0.4}

    if not hasattr(genai, "GenerativeModel"):
        # Safety fallback if SDK shape is unexpected
        return {"type": "meeting", "title": subject[:140], "confidence": 0.5}

    # Configure and call Gemini
    try:
        if hasattr(genai, "configure"):
            genai.configure(api_key=settings.GEMINI_API_KEY)  # type: ignore[attr-defined]
    except Exception:
        pass
    prompt = f"Subject: {subject}\n\nBody:\n{body}\n\n{SCHEMA_PROMPT}"
    model = genai.GenerativeModel(MODEL)  # type: ignore[attr-defined]
    resp = model.generate_content(prompt, request_options={"timeout": settings.REQUEST_TIMEOUT_SECONDS or 30})
    text = (getattr(resp, "text", None) or "").strip()
    if text.startswith("```"):
        try:
            text = text.split("```")[-2]
        except Exception:
            pass
    try:
        data = json.loads(text)
        if not isinstance(data, dict):
            raise ValueError("unexpected response")
        return data
    except Exception:
        # very defensive fallback
        return {"type": "meeting", "title": subject[:140], "confidence": 0.5}
