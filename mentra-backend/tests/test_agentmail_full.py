import hmac
import hashlib
import uuid
from fastapi.testclient import TestClient
from app.main import app

API_TOKEN = "devsecret123"


def sign(body: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def make_plain_email(message_id: str) -> bytes:
    return (f"From: Prof <prof@example.edu>\n"
            f"To: you@example.com\n"
            f"Subject: Homework 3 due Friday\n"
            f"Message-ID: <{message_id}>\n"
            f"MIME-Version: 1.0\n"
            f"Content-Type: text/plain; charset=us-ascii\n\n"
            f"Please submit before 11:59pm.\n").encode()


def make_ics_email(message_id: str) -> bytes:
    return ("From: Dr. Smith <smith@univ.edu>\n"
            "To: you@example.com\n"
            "Subject: Office hours Friday\n"
            f"Message-ID: <{message_id}>\n"
            "MIME-Version: 1.0\n"
            "Content-Type: multipart/mixed; boundary=XYZ\n\n"
            "--XYZ\n"
            "Content-Type: text/plain; charset=us-ascii\n\n"
            "Let's meet to discuss.\n\n"
            "--XYZ\n"
            "Content-Type: text/calendar; method=REQUEST; charset=UTF-8\n\n"
            "BEGIN:VCALENDAR\n"
            "VERSION:2.0\n"
            "PRODID:-//Mentra Demo//EN\n"
            "BEGIN:VEVENT\n"
            "UID:evt-xyz\n"
            "DTSTAMP:20250928T120000Z\n"
            "DTSTART:20251003T140000Z\n"
            "DTEND:20251003T143000Z\n"
            "SUMMARY:Office Hours\n"
            "LOCATION: Room 101\n"
            "DESCRIPTION: Discuss project timeline\n"
            "END:VEVENT\n"
            "END:VCALENDAR\n\n"
            "--XYZ--\n").encode()


def test_plaintext_inbound_creates_proposal_and_list(monkeypatch):
    secret = "s3cr3t"
    monkeypatch.setenv("AGENTMAIL_WEBHOOK_SECRET", secret)
    body = make_plain_email(f"mid-plain-{uuid.uuid4()}")
    sig = sign(body, secret)
    with TestClient(app) as client:
        r = client.post("/email/inbound", content=body, headers={"X-Agentmail-Signature": sig})
        assert r.status_code == 200
        pid = r.json().get("proposal_id")
        assert pid
        # List pending proposals
        r2 = client.get("/proposals", headers={"Authorization": f"Bearer {API_TOKEN}"})
        assert r2.status_code == 200
        items = r2.json()
        assert any(p["id"] == pid and p["status"] == "pending" for p in items)


def test_dedupe_by_message_id(monkeypatch):
    secret = "s3cr3t"
    monkeypatch.setenv("AGENTMAIL_WEBHOOK_SECRET", secret)
    dup_id = f"mid-dup-{uuid.uuid4()}"
    body = make_plain_email(dup_id)
    sig = sign(body, secret)
    with TestClient(app) as client:
        r1 = client.post("/email/inbound", content=body, headers={"X-Agentmail-Signature": sig})
        assert r1.status_code == 200
        r2 = client.post("/email/inbound", content=body, headers={"X-Agentmail-Signature": sig})
        assert r2.status_code == 200
        assert r2.json().get("status") == "duplicate"


def test_ics_inbound_confirm_and_ics_feed(monkeypatch):
    secret = "s3cr3t"
    monkeypatch.setenv("AGENTMAIL_WEBHOOK_SECRET", secret)
    body = make_ics_email(f"mid-ics-{uuid.uuid4()}")
    sig = sign(body, secret)
    with TestClient(app) as client:
        # Inbound
        r = client.post("/email/inbound", content=body, headers={"X-Agentmail-Signature": sig})
        assert r.status_code == 200
        pid = r.json().get("proposal_id")
        assert pid
        # Confirm
        rc = client.post(f"/proposals/{pid}/confirm", headers={"Authorization": f"Bearer {API_TOKEN}"})
        assert rc.status_code == 200
        event_id = rc.json().get("event_id")
        assert event_id
        # ICS feed should include the summary
        feed = client.get("/calendar/feed.ics")
        assert feed.status_code == 200
        text = feed.text
        assert "SUMMARY:Office Hours" in text


def test_websocket_receives_proposal_created(monkeypatch):
    secret = "s3cr3t"
    monkeypatch.setenv("AGENTMAIL_WEBHOOK_SECRET", secret)
    body = make_plain_email(f"mid-ws-{uuid.uuid4()}")
    sig = sign(body, secret)
    with TestClient(app) as client:
        with client.websocket_connect(f"/ws/notify?token={API_TOKEN}") as ws:
            r = client.post("/email/inbound", content=body, headers={"X-Agentmail-Signature": sig})
            assert r.status_code == 200
            # Receive broadcast
            msg = ws.receive_json()
            assert msg.get("event_type") == "proposal.created"
            data = msg.get("data") or {}
            assert data.get("proposal_id")


def test_reject_then_list_rejected(monkeypatch):
    secret = "s3cr3t"
    monkeypatch.setenv("AGENTMAIL_WEBHOOK_SECRET", secret)
    body = make_plain_email(f"mid-reject-{uuid.uuid4()}")
    sig = sign(body, secret)
    with TestClient(app) as client:
        r = client.post("/email/inbound", content=body, headers={"X-Agentmail-Signature": sig})
        assert r.status_code == 200
        pid = r.json().get("proposal_id")
        rr = client.post(f"/proposals/{pid}/reject", headers={"Authorization": f"Bearer {API_TOKEN}"})
        assert rr.status_code == 200
        # Should appear under rejected
        lr = client.get("/proposals", params={"status": "rejected"}, headers={"Authorization": f"Bearer {API_TOKEN}"})
        assert lr.status_code == 200
        items = lr.json()
        assert any(p["id"] == pid and p["status"] == "rejected" for p in items)
