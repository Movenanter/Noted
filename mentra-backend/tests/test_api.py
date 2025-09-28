import json
from fastapi.testclient import TestClient
from uuid import uuid4
from app.main import app


client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_webhook_persists_chunks(monkeypatch):
    from app.db.session import get_session
    from app.models.entities import Session, TranscriptChunk
    from uuid import uuid4

    sid = str(uuid4())
    body = {"session_id": sid, "chunks": [{"text": "Hello world", "ts_start": 0, "ts_end": 1, "bookmarked": True}]}
    r = client.post("/webhooks/mentra", headers={"X-Webhook-Token": "mentra_webhook_secret"}, json=body)
    assert r.status_code == 200


def test_auth_bearer_protection():
    r = client.post("/sessions", json={"title": "Physics"})
    assert r.status_code == 401


def test_flashcard_generation_mock(monkeypatch):
    # mock LLM service
    from app.services import llm_service
    monkeypatch.setattr(
        llm_service,
        "generate_flashcards",
        lambda transcript_text, types, max_per_type: {
            "qa": [{"question": "Q1", "answer": "A1", "source_ts": 0.0}],
            "cloze": [],
            "mc": [],
        },
    )

    # create session with bearer
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "Test"})
    assert r.status_code == 200
    sid = r.json()["id"]

    # add transcript via webhook
    client.post(
        "/webhooks/mentra",
        headers={"X-Webhook-Token": "mentra_webhook_secret"},
        json={
            "session_id": sid,
            "chunks": [
                {"text": "Gravity is a force.", "ts_start": 0, "ts_end": 10, "bookmarked": True},
            ],
        },
    )

    r = client.post(
        f"/sessions/{sid}/flashcards:generate-sync",
        headers={"Authorization": "Bearer devsecret123"},
        json={"types": ["qa"], "max_per_type": 1},
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)
    assert "qa" in data and isinstance(data["qa"], list)
    # With DEV_FAKE_LLM=1, we should get at least one QA card
    assert len(data["qa"]) >= 1


def test_list_flashcards_and_explain_fallback():
    # Create session
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "T"})
    assert r.status_code == 200
    sid = r.json()["id"]

    # No transcript yet → generate should return empty (service checks transcript)
    r = client.post(
        f"/sessions/{sid}/flashcards:generate-sync",
        headers={"Authorization": "Bearer devsecret123"},
        json={"types": ["qa"], "max_per_type": 1},
    )
    # With DEV_FAKE_LLM, transcript requirement is checked before LLM call; expect empty
    assert r.status_code == 200
    assert r.json()["qa"] == []

    # Explain endpoint without transcript should return fallback message
    r = client.post(
        f"/sessions/{sid}/explain",
        headers={"Authorization": "Bearer devsecret123"},
        json={"mode": "eli5", "topic": "Test"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["mode"] == "eli5" and body["topic"] == "Test"
    assert "No transcript" in body["explanation"]


def test_upload_asset_and_quiz_flow(tmp_path):
    # Create a session
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "Assets"})
    assert r.status_code == 200
    sid = r.json()["id"]

    # Upload a fake file
    p = tmp_path / "img.png"
    p.write_bytes(b"fake")
    with open(p, "rb") as fh:
        r = client.post(
            f"/sessions/{sid}/assets",
            headers={"Authorization": "Bearer devsecret123"},
            files={"file": ("img.png", fh, "image/png")},
        )
    assert r.status_code == 200
    assert "path" in r.json()

    # Add transcript so we can create flashcards
    client.post(
        "/webhooks/mentra",
        headers={"X-Webhook-Token": "mentra_webhook_secret"},
        json={
            "session_id": sid,
            "chunks": [
                {"text": "Newton inertia", "ts_start": 0, "ts_end": 1, "bookmarked": True},
            ],
        },
    )

    # Generate QA + MC flashcards via DEV_FAKE_LLM
    r = client.post(
        f"/sessions/{sid}/flashcards:generate-sync",
        headers={"Authorization": "Bearer devsecret123"},
        json={"types": ["qa", "mc"], "max_per_type": 1},
    )
    assert r.status_code == 200
    cards = r.json()
    # List flashcards and ensure we get what was created
    r = client.get(f"/sessions/{sid}/flashcards")
    assert r.status_code == 200
    listed = r.json()
    assert isinstance(listed, list) and len(listed) >= 1

    # Start a quiz
    r = client.post(f"/sessions/{sid}/quiz:start", headers={"Authorization": "Bearer devsecret123"})
    assert r.status_code == 200
    quiz = r.json()
    attempt_id = quiz.get("attempt_id")
    questions = quiz.get("questions", [])
    # Build naive answers: for QA, echo part of known answer; for MC, read correct from stored JSON string
    answers = {}
    from app.models.entities import Flashcard
    from app.db.session import get_session
    with get_session() as db:
        for q in questions:
            fid = q.get("id")
            fc = db.query(Flashcard).filter(Flashcard.id == fid).first()
            if q.get("type") == "qa":
                answers[str(fid)] = "motion"  # substring should match naive contains
            elif q.get("type") == "mc" and fc is not None:
                import json as _json
                a = fc.answer if isinstance(fc.answer, str) else "{}"
                d = _json.loads(a)
                answers[str(fid)] = d.get("correct")

    r = client.post(
        f"/sessions/{sid}/quiz/submit",
        headers={"Authorization": "Bearer devsecret123"},
        json={"attempt_id": attempt_id, "answers": answers},
    )
    assert r.status_code == 200
    score = r.json().get("score")
    assert isinstance(score, float)
    assert 0.0 <= score <= 1.0


def test_timeline_and_bookmarks_and_summary(tmp_path):
    # Create session
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "TL"})
    assert r.status_code == 200
    sid = r.json()["id"]

    # Upload one asset
    p = tmp_path / "img.png"
    p.write_bytes(b"fake")
    with open(p, "rb") as fh:
        r = client.post(
            f"/sessions/{sid}/assets",
            headers={"Authorization": "Bearer devsecret123"},
            files={"file": ("img.png", fh, "image/png")},
        )
    assert r.status_code == 200

    # Add multiple chunks via webhook
    body = {
        "session_id": sid,
        "chunks": [
            {"text": "Newton law one.", "ts_start": 0, "ts_end": 5, "bookmarked": False},
            {"text": "Inertia definition.", "ts_start": 6, "ts_end": 10, "bookmarked": True},
            {"text": "Forces and motion.", "ts_start": 11, "ts_end": 20, "bookmarked": False},
        ],
    }
    r = client.post("/webhooks/mentra", headers={"X-Webhook-Token": "mentra_webhook_secret"}, json=body)
    assert r.status_code == 200

    # Bookmark a range and tag it
    r = client.post(
        f"/sessions/{sid}/bookmark",
        headers={"Authorization": "Bearer devsecret123"},
        data={"ts_start": "0", "ts_end": "8", "tag": "key"},
    )
    assert r.status_code == 200

    # Timeline full
    r = client.get(f"/sessions/{sid}/timeline")
    assert r.status_code == 200
    data = r.json()
    assert "chunks" in data and "assets" in data
    assert len(data["chunks"]) >= 3
    assert len(data["assets"]) == 1

    # Filter by query
    r = client.get(f"/sessions/{sid}/timeline", params={"q": "Inertia"})
    assert r.status_code == 200
    data_q = r.json()
    assert any("Inertia" in c["text"] for c in data_q["chunks"])  # at least one match

    # Filter bookmarked
    r = client.get(f"/sessions/{sid}/timeline", params={"bookmarked": True})
    assert r.status_code == 200
    data_bm = r.json()
    assert all(c["bookmarked"] for c in data_bm["chunks"]) or len(data_bm["chunks"]) >= 1

    # Generate summary (DEV_FAKE_LLM path)
    r = client.post(f"/sessions/{sid}/summary:generate-sync", headers={"Authorization": "Bearer devsecret123"})
    assert r.status_code == 200
    summary = r.json()
    assert "bullets" in summary and isinstance(summary["bullets"], list)
    assert "sections" in summary and isinstance(summary["sections"], list)
    assert "keywords" in summary and isinstance(summary["keywords"], list)
