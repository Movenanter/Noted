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


def analyze_image(image_bytes: bytes, mime: str = "image/png", prompt: str | None = None) -> str:
    """
    Analyze an image using Gemini multimodal. Fallback to OCR if dev mode or error.
    Returns extracted text/description suitable to append to session transcript.
    """
    # Dev deterministic
    if getattr(settings, "DEV_FAKE_LLM", False):
        # Light OCR style fallback if available
        try:
            import pytesseract  # type: ignore
            from PIL import Image  # type: ignore
            import io
            img = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(img)
            text = text.strip()
            if text:
                return f"(image-ocr) {text}"
        except Exception:
            pass
        return "(fake-image) A photo with notes about the topic; bullet points and formulas visible."

    # Try Gemini multimodal
    try:
        _ensure_clients()
        gen_model_factory = getattr(_gemini_client, "GenerativeModel", None)
        if not callable(gen_model_factory):
            raise HTTPException(status_code=500, detail={"detail": "Gemini client missing GenerativeModel", "code": "llm_import"})
        model_name = settings.MODEL or "gemini-1.5-pro"
        model = gen_model_factory(model_name)
        b64 = base64.b64encode(image_bytes).decode("ascii")
        try:
            resp = model.generate_content(
                [
                    prompt or "Extract clear, concise study notes from this image. If text is present, OCR and summarize it.",
                    {"mime_type": mime, "data": b64},
                ],
                request_options={"timeout": settings.REQUEST_TIMEOUT_SECONDS},
            )
            txt = getattr(resp, "text", "") or ""
            return txt.strip()
        except TypeError:
            resp = model.generate_content(
                contents=[
                    {
                        "role": "user",
                        "parts": [
                            {"text": prompt or "Extract clear, concise study notes from this image. If text is present, OCR and summarize it."},
                            {"inline_data": {"mime_type": mime, "data": b64}},
                        ],
                    }
                ]
            )
            txt = getattr(resp, "text", "") or ""
            return txt.strip()
    except Exception:
        # Fallback to OCR
        try:
            import pytesseract  # type: ignore
            from PIL import Image  # type: ignore
            import io
            img = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(img)
            return (text or "").strip()
        except Exception as e:
            raise HTTPException(status_code=502, detail={"detail": f"Vision analysis failed: {e}", "code": "vision_error"})
