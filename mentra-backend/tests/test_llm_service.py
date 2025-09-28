import json as _json
import importlib
import sys
from types import ModuleType
import pytest
from fastapi import HTTPException


def _reload_with_env(monkeypatch, provider: str, model: str = "gemini-1.5-pro", use_fake: bool = False):
    # Configure environment and reload settings + llm_service (Gemini-only)
    monkeypatch.setenv("GOOGLE_API_KEY", "test-google-key")
    monkeypatch.setenv("MODEL", model)
    # Ensure fake mode is disabled unless explicitly requested per test
    monkeypatch.setenv("DEV_FAKE_LLM", "1" if use_fake else "0")

    import app.core.config as cfg
    import app.services.llm_service as llm
    importlib.reload(cfg)
    importlib.reload(llm)
    return cfg, llm


def test_gemini_success(monkeypatch):
    # Build fake google.generativeai module
    class FakeResponse:
        def __init__(self, text):
            self.text = text

    class FakeModel:
        def __init__(self, name):
            self.name = name

        def generate_content(self, parts, generation_config=None):
            payload = {
                "qa": [{"question": "Q?", "answer": "A", "source_ts": 0}],
                "cloze": [],
                "mc": [],
            }
            return FakeResponse(_json.dumps(payload))

    fake_google = ModuleType("google")
    fake_gen = ModuleType("google.generativeai")

    def configure(api_key=None):  # noqa: ARG001
        return None

    fake_gen.configure = configure  # type: ignore[attr-defined]
    fake_gen.GenerativeModel = FakeModel  # type: ignore[attr-defined]
    sys.modules["google"] = fake_google
    sys.modules["google.generativeai"] = fake_gen

    cfg, llm = _reload_with_env(monkeypatch, provider="gemini", model="gemini-1.5-pro")
    out = llm.generate_flashcards("t", ["qa"], 2)
    assert len(out["qa"]) == 1
    assert out["cloze"] == []
    assert out["mc"] == []
    # explain_topic should return a string using the same fake client
    txt = llm.explain_topic("gravity", "eli5")
    assert isinstance(txt, str)


def test_gemini_invalid_json(monkeypatch):
    class FakeModel:
        def __init__(self, name):
            pass

        def generate_content(self, parts, generation_config=None):  # noqa: ARG002
            class R:
                text = "not json"

            return R()

    fake_google = ModuleType("google")
    fake_gen = ModuleType("google.generativeai")
    fake_gen.configure = lambda api_key=None: None  # type: ignore[attr-defined]
    fake_gen.GenerativeModel = FakeModel  # type: ignore[attr-defined]
    sys.modules["google"] = fake_google
    sys.modules["google.generativeai"] = fake_gen

    cfg, llm = _reload_with_env(monkeypatch, provider="gemini")
    with pytest.raises(HTTPException) as exc:
        llm.generate_flashcards("t", ["qa"], 1)
    assert exc.value.status_code == 502
    detail = getattr(exc.value, "detail", None)
    assert isinstance(detail, dict)
    assert detail.get("code") == "LLM_BAD_FORMAT"


def test_gemini_exception(monkeypatch):
    class FakeModel:
        def __init__(self, name):
            pass

        def generate_content(self, parts, generation_config=None):  # noqa: ARG002
            raise RuntimeError("boom")

    fake_google = ModuleType("google")
    fake_gen = ModuleType("google.generativeai")
    fake_gen.configure = lambda api_key=None: None  # type: ignore[attr-defined]
    fake_gen.GenerativeModel = FakeModel  # type: ignore[attr-defined]
    sys.modules["google"] = fake_google
    sys.modules["google.generativeai"] = fake_gen

    cfg, llm = _reload_with_env(monkeypatch, provider="gemini")
    with pytest.raises(HTTPException) as exc:
        llm.generate_flashcards("t", ["qa"], 1)
    assert exc.value.status_code == 502
    detail = getattr(exc.value, "detail", None)
    assert isinstance(detail, dict)
    assert detail.get("code") == "llm_error"
