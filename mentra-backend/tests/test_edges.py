from fastapi.testclient import TestClient
from uuid import uuid4
from app.main import app

client = TestClient(app)


def test_webhook_invalid_token_rejected():
    body = {"session_id": "bad", "chunks": [{"text": "x"}]}
    r = client.post("/webhooks/mentra", headers={"X-Webhook-Token": "wrong"}, json=body)
    assert r.status_code == 401


def test_quiz_start_without_flashcards_returns_400():
    # Create a fresh session without any flashcards
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "NoCards"})
    assert r.status_code == 200
    sid = r.json()["id"]

    r = client.post(f"/sessions/{sid}/quiz:start", headers={"Authorization": "Bearer devsecret123"})
    assert r.status_code == 400


def test_upload_asset_invalid_session_404(tmp_path):
    missing_sid = f"missing-{uuid4()}"
    p = tmp_path / "img.png"
    p.write_bytes(b"fake")
    with open(p, "rb") as fh:
        r = client.post(
            f"/sessions/{missing_sid}/assets",
            headers={"Authorization": "Bearer devsecret123"},
            files={"file": ("img.png", fh, "image/png")},
        )
    assert r.status_code == 404


ession_id_fixture_note = ""


def test_list_flashcards_requires_bearer():
    # Create a session with auth
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "Sec"})
    assert r.status_code == 200
    sid = r.json()["id"]
    # Access without bearer should be 401
    r = client.get(f"/sessions/{sid}/flashcards")
    assert r.status_code == 401


def test_websocket_flush_without_audio_returns_empty_final():
    # Create session
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "WS"})
    assert r.status_code == 200
    sid = r.json()["id"]

    with client.websocket_connect(f"/ws/sessions/{sid}/live-audio") as ws:
        # Immediately flush with no prior audio
        ws.send_text("flush")
        resp = ws.receive_json()
        assert resp.get("final") is True
        assert isinstance(resp.get("transcript"), str)
        # With no audio buffered, transcript should be empty string
        assert resp.get("transcript") == ""
