import hmac
import hashlib
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

RAW = (f"From: Test <t@example.com>\nSubject: Meeting\nMessage-ID: <m1-{uuid.uuid4()}@example.com>\nMIME-Version: 1.0\nContent-Type: text/plain; charset=us-ascii\n\nLet's meet.").encode()


def sign(body: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def test_agentmail_webhook_invalid_signature(monkeypatch):
    monkeypatch.setenv("AGENTMAIL_WEBHOOK_SECRET", "shhh")
    # Missing header
    r = client.post("/email/inbound", content=RAW)
    assert r.status_code == 401
    # Wrong signature
    r = client.post("/email/inbound", content=RAW, headers={"X-Agentmail-Signature": "deadbeef"})
    assert r.status_code == 401


def test_agentmail_webhook_valid_signature(monkeypatch):
    monkeypatch.setenv("AGENTMAIL_WEBHOOK_SECRET", "shhh")
    sig = sign(RAW, "shhh")
    r = client.post("/email/inbound", content=RAW, headers={"X-Agentmail-Signature": sig})
    assert r.status_code == 200
    assert r.json().get("proposal_id")
