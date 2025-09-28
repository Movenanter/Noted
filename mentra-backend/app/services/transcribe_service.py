from __future__ import annotations

import base64
from typing import Any

from fastapi import HTTPException, status
from ..core.config import settings


_gemini_client: Any = None


def _ensure_clients():
    global _gemini_client
    if _gemini_client is None:
        try:
            import google.generativeai as genai  # type: ignore[import-not-found]
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"detail": f"Gemini client import failed: {e}", "code": "llm_import"})
        if not settings.GOOGLE_API_KEY:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"detail": "GOOGLE_API_KEY is required for Gemini", "code": "llm_config"})
        _configure = getattr(genai, "configure", None)
        if callable(_configure):
            _configure(api_key=settings.GOOGLE_API_KEY)
        _gemini_client = genai


def transcribe_wav_bytes(wav_bytes: bytes, prompt: str | None = None, mime: str = "audio/wav") -> str:
    if getattr(settings, "DEV_FAKE_LLM", False):
        # Simple deterministic output for development
        return "(fake) hello world"

    _ensure_clients()
    gen_model_factory = getattr(_gemini_client, "GenerativeModel", None)
    if not callable(gen_model_factory):
        raise HTTPException(status_code=500, detail={"detail": "Gemini client missing GenerativeModel", "code": "llm_import"})
    model_name = settings.MODEL or "gemini-1.5-pro"
    model = gen_model_factory(model_name)
    b64 = base64.b64encode(wav_bytes).decode("ascii")
    try:
        resp = model.generate_content(
            [
                prompt or "Transcribe this audio to plain text.",
                {"mime_type": mime, "data": b64},
            ],
            request_options={"timeout": settings.REQUEST_TIMEOUT_SECONDS},
        )
        txt = getattr(resp, "text", "") or ""
    except TypeError:
        # Older SDK may require parts as dicts in 'contents'
        resp = model.generate_content(
            contents=[
                {
                    "role": "user",
                    "parts": [
                        {"text": prompt or "Transcribe this audio to plain text."},
                        {"inline_data": {"mime_type": mime, "data": b64}},
                    ],
                }
            ]
        )
        txt = getattr(resp, "text", "") or ""
    except Exception as e:
        raise HTTPException(status_code=502, detail={"detail": f"LLM error: {e}", "code": "llm_error"})
    return txt.strip()
