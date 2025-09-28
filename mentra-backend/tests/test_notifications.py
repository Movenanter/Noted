from fastapi.testclient import TestClient
from app.main import app


def test_notifications_websocket_streams_events(tmp_path):
    # Use a single TestClient as context manager to keep the portal running
    with TestClient(app) as client:
        # Connect to notifications with token
        with client.websocket_connect(f"/ws/notify?token=devsecret123") as ws:
            # Create a session (should broadcast session.created)
            r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "Notif"})
            assert r.status_code == 200
            sid = r.json()["id"]

            # Upload an asset to generate another event
            p = tmp_path / "img.png"
            p.write_bytes(b"fake")
            with open(p, "rb") as fh:
                r2 = client.post(
                    f"/sessions/{sid}/assets",
                    headers={"Authorization": "Bearer devsecret123"},
                    files={"file": ("img.png", fh, "image/png")},
                )
            assert r2.status_code == 200

            # Receive at least one event, then a second event
            evt1 = ws.receive_json()
            assert "event_type" in evt1 and evt1.get("event_type") == "session.created"
            evt2 = ws.receive_json()
            # second could be asset.uploaded or others depending on timing
            assert "event_type" in evt2
