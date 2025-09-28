import io
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_upload_transcribe_creates_chunk(tmp_path):
    # Create session
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "Rec"})
    assert r.status_code == 200
    sid = r.json()["id"]

    # Create a tiny in-memory WAV-like payload; in DEV_FAKE_LLM this content is ignored
    wav_bytes = b"RIFF" + b"\x00" * 2000
    fileobj = io.BytesIO(wav_bytes)

    r = client.post(
        f"/sessions/{sid}/transcribe",
        headers={"Authorization": "Bearer devsecret123"},
        files={"file": ("audio.wav", fileobj, "audio/wav")},
    )
    assert r.status_code == 200
    data = r.json()
    assert "text" in data and isinstance(data["text"], str)

    # Verify a transcript chunk was created
    from app.db.session import get_session
    from app.models.entities import TranscriptChunk
    with get_session() as db:
        rows = db.query(TranscriptChunk).filter(TranscriptChunk.session_id == sid).all()
        assert len(rows) >= 1


def test_websocket_live_audio_streaming_basic():
    # Create session
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "Live"})
    assert r.status_code == 200
    sid = r.json()["id"]

    # Connect to WebSocket and send a binary frame > threshold to trigger transcription
    with client.websocket_connect(f"/ws/sessions/{sid}/live-audio") as ws:
        ws.send_bytes(b"\x00" * 20000)
        resp = ws.receive_json()
        assert "transcript" in resp and isinstance(resp["transcript"], str)

        # Request a flush
        ws.send_text("flush")
        resp2 = ws.receive_json()
        assert "transcript" in resp2 and resp2.get("final") is True
