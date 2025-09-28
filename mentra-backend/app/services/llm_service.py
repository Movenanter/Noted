from typing import List, Literal, Any, cast, Dict
import json
import httpx
from ..core.config import settings
from ..core.security import api_error


FlashcardType = Literal["qa", "cloze", "mc"]


_gemini_client: Any = None

def _ensure_clients():
    global _gemini_client
    if _gemini_client is None:
        try:
            import google.generativeai as genai  # type: ignore[import-not-found]
        except Exception as e:
            api_error(f"Gemini client import failed: {e}", code="llm_import")
        if not settings.GOOGLE_API_KEY:
            api_error("GOOGLE_API_KEY is required for Gemini", code="llm_config")
        _configure = getattr(genai, "configure", None)
        if callable(_configure):
            _configure(api_key=settings.GOOGLE_API_KEY)
        _gemini_client = genai


def _flashcards_system_prompt() -> str:
    return (
        "You are a helpful study assistant. Given a lecture transcript, create concise flashcards. "
        "Return strictly JSON with keys 'qa', 'cloze', 'mc'. Each key maps to a list of objects with: "
        "{question, answer, source_ts}. 'mc' question should include 1 correct answer and 3 plausible distractors in 'answer' as a JSON object: {correct: string, choices: [4 strings]}. "
        "Avoid preambles or explanations."
    )


def generate_flashcards(transcript_text: str, types: List[FlashcardType], max_per_type: int):
    # Dev-mode: bypass external calls and return deterministic content
    if getattr(settings, "DEV_FAKE_LLM", False):
        demo = {
            "qa": [
                {"question": "What is Newton's First Law?", "answer": "An object in motion stays in motion unless acted upon by a net external force.", "source_ts": 0}
            ],
            "cloze": [
                {"question": "An object in ____ stays in ____ unless acted upon by a ____.", "answer": "motion; motion; net external force", "source_ts": 10}
            ],
            "mc": [
                {"question": "Which best describes inertia?", "answer": {"correct": "Resistance to change in motion", "choices": ["Resistance to change in motion", "Increase in speed", "Decrease in mass", "Change in direction only"]}, "source_ts": 20}
            ],
        }
        out = {"qa": [], "cloze": [], "mc": []}
        for t in ["qa", "cloze", "mc"]:
            if t in types:
                out[t] = demo[t][: max(0, int(max_per_type))]
        return out

    prompt = (
        "Transcript:\n" + transcript_text[:12000] + "\n\n"  # limit size for demo
        + f"Types: {','.join(types)}; Max per type: {max_per_type}.\n"
        + "Respond with strict JSON: {\n  \"qa\": [{\"question\": str, \"answer\": str, \"source_ts\": number|null}],\n"
        + "  \"cloze\": [{\"question\": str, \"answer\": str, \"source_ts\": number|null}],\n"
        + "  \"mc\": [{\"question\": str, \"answer\": {\"correct\": str, \"choices\": [str, str, str, str]}, \"source_ts\": number|null}]\n}"
    )

    _ensure_clients()
    content = None
    try:
        with httpx.Client(timeout=settings.REQUEST_TIMEOUT_SECONDS) as _:
            # Gemini JSON output
            model_name = settings.MODEL or "gemini-1.5-pro"
            gen_model_factory = getattr(_gemini_client, "GenerativeModel", None)
            if not callable(gen_model_factory):
                api_error("Gemini client missing GenerativeModel", code="llm_import")
            gen_model = cast(Any, gen_model_factory)(model_name)
            try:
                response = gen_model.generate_content(
                    [
                        _flashcards_system_prompt(),
                        prompt,
                    ],
                    generation_config={"response_mime_type": "application/json"},
                    request_options={"timeout": settings.REQUEST_TIMEOUT_SECONDS},
                )
            except TypeError:
                # Older fakes/SDKs may not accept request_options; try without it
                response = gen_model.generate_content(
                    [
                        _flashcards_system_prompt(),
                        prompt,
                    ],
                    generation_config={"response_mime_type": "application/json"},
                )
            content = getattr(response, "text", None)
    except httpx.TimeoutException:
        api_error("LLM timeout", code="LLM_TIMEOUT", status_code=504)
    except Exception as e:
        api_error(f"LLM request failed: {e}", code="llm_error", status_code=502)
    if not content:
        api_error("Empty LLM response", code="llm_empty", status_code=502)

    try:
        data = json.loads(str(content))
    except Exception:
        api_error("LLM output not valid JSON", code="LLM_BAD_FORMAT", status_code=502)

    out = {"qa": [], "cloze": [], "mc": []}
    for t in ["qa", "cloze", "mc"]:
        if t in types and isinstance(data.get(t), list):
            out[t] = data[t][: max(0, int(max_per_type))]

    return out


def explain_topic(topic: str, mode: Literal["eli5","technical","analogy"]) -> str:
    if getattr(settings, "DEV_FAKE_LLM", False):
        if mode == "eli5":
            return f"{topic}: It's like a toy car that keeps rolling until something stops it."
        if mode == "analogy":
            return f"{topic}: Think of it like riding a bike—balance and motion work together."
        return f"{topic}: A concise technical explanation goes here."

    _ensure_clients()
    prompt = (
        "Explain the following topic in the requested style. Be concise.\n"
        f"Mode: {mode}\n"
        f"Topic: {topic}\n"
    )
    try:
        with httpx.Client(timeout=settings.REQUEST_TIMEOUT_SECONDS) as _:
            model_name = settings.MODEL or "gemini-1.5-pro"
            gen_model_factory = getattr(_gemini_client, "GenerativeModel", None)
            if not callable(gen_model_factory):
                api_error("Gemini client missing GenerativeModel", code="llm_import")
            gen_model = cast(Any, gen_model_factory)(model_name)
            try:
                response = gen_model.generate_content(
                    [prompt],
                    request_options={"timeout": settings.REQUEST_TIMEOUT_SECONDS},
                )
            except TypeError:
                response = gen_model.generate_content([prompt])
            return getattr(response, "text", "") or ""
    except httpx.TimeoutException:
        api_error("LLM timeout", code="LLM_TIMEOUT", status_code=504)
    except Exception as e:
        api_error(f"LLM request failed: {e}", code="llm_error", status_code=502)
    return ""


def generate_from_image(image_text: str, types: List[FlashcardType], max_per_type: int):
    # Reuse the same prompting but with image text
    return generate_flashcards(image_text, types, max_per_type)


def generate_summary(text: str) -> Dict[str, Any]:
    if getattr(settings, "DEV_FAKE_LLM", False):
        return {
            "bullets": [
                "Newton's First Law: inertia and motion.",
                "Key terms: inertia, net external force.",
            ],
            "sections": [
                {"title": "Inertia", "points": ["Resistance to change in motion."]},
                {"title": "Applications", "points": ["Everyday examples of inertia."]},
            ],
            "keywords": ["inertia", "motion", "force"],
        }

    _ensure_clients()
    prompt = (
        "Create a structured summary in strict JSON with keys: "
        "{ bullets: [string], sections: [{title: string, points: [string]}], keywords: [string] }.\n"
        "Avoid any non-JSON preamble.\n"
        f"Transcript:\n{text[:12000]}\n"
    )

    content = None
    try:
        with httpx.Client(timeout=settings.REQUEST_TIMEOUT_SECONDS) as _:
            model_name = settings.MODEL or "gemini-1.5-pro"
            gen_model_factory = getattr(_gemini_client, "GenerativeModel", None)
            if not callable(gen_model_factory):
                api_error("Gemini client missing GenerativeModel", code="llm_import")
            gen_model = cast(Any, gen_model_factory)(model_name)
            try:
                response = gen_model.generate_content(
                    [prompt],
                    generation_config={"response_mime_type": "application/json"},
                    request_options={"timeout": settings.REQUEST_TIMEOUT_SECONDS},
                )
            except TypeError:
                response = gen_model.generate_content(
                    [prompt],
                    generation_config={"response_mime_type": "application/json"},
                )
            content = getattr(response, "text", None)
    except httpx.TimeoutException:
        api_error("LLM timeout", code="LLM_TIMEOUT", status_code=504)
    except Exception as e:
        api_error(f"LLM request failed: {e}", code="llm_error", status_code=502)
    if not content:
        api_error("Empty LLM response", code="llm_empty", status_code=502)

    try:
        return cast(Dict[str, Any], json.loads(str(content)))
    except Exception:
        api_error("LLM output not valid JSON", code="LLM_BAD_FORMAT", status_code=502)
    return {}
