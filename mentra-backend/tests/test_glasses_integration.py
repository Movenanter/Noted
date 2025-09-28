from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def _create_session(title: str = "Glasses Test") -> str:
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": title})
    assert r.status_code == 200
    return r.json()["id"]


def test_glasses_websocket_flush_returns_final_transcript():
    sid = _create_session()
    with client.websocket_connect(f"/ws/sessions/{sid}/live-audio") as ws:
        # send enough bytes to trigger transcription callback
        ws.send_bytes(b"\x00" * 20000)
        msg = ws.receive_json()
        assert "transcript" in msg
        # flush
        ws.send_text("flush")
        msg2 = ws.receive_json()
        assert msg2.get("final") is True
        assert isinstance(msg2.get("transcript"), str)


def test_glasses_upload_asset_and_timeline(tmp_path):
    sid = _create_session()
    p = tmp_path / "photo.png"
    p.write_bytes(b"fakepng")
    with open(p, "rb") as fh:
        r = client.post(
            f"/sessions/{sid}/assets",
            headers={"Authorization": "Bearer devsecret123"},
            files={"file": ("photo.png", fh, "image/png")},
        )
    assert r.status_code == 200
    r = client.get(f"/sessions/{sid}/timeline", headers={"Authorization": "Bearer devsecret123"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data.get("assets"), list)
    assert len(data.get("assets")) >= 1
