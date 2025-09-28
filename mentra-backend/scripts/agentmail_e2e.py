#!/usr/bin/env python3
import os, sys, time, hmac, hashlib, uuid, requests
from datetime import datetime, timedelta, timezone

BASE = os.environ.get("BASE", os.environ.get("BACKEND_BASE", "http://127.0.0.1:8020")).rstrip("/")
TOKEN = os.environ.get("API_BEARER_TOKEN", "devsecret123")
SECRET = os.environ.get("AGENTMAIL_WEBHOOK_SECRET", "dev-demo-secret")

def sign(body_bytes: bytes) -> str:
    return hmac.new(SECRET.encode(), body_bytes, hashlib.sha256).hexdigest()

def post_inbound(email_bytes: bytes):
    sig = sign(email_bytes)
    r = requests.post(f"{BASE}/email/inbound",
                      headers={"X-Agentmail-Signature": sig,
                               "Content-Type": "message/rfc822"},
                      data=email_bytes,
                      timeout=20)
    r.raise_for_status()
    return r.json()

def list_proposals(status="pending"):
    r = requests.get(f"{BASE}/proposals",
                     params={"status": status},
                     headers={"Authorization": f"Bearer {TOKEN}"},
                     timeout=20)
    r.raise_for_status()
    return r.json()

def confirm(pid: str):
    r = requests.post(f"{BASE}/proposals/{pid}/confirm",
                      headers={"Authorization": f"Bearer {TOKEN}"},
                      timeout=20)
    r.raise_for_status()
    return r.json()

def feed():
    r = requests.get(f"{BASE}/calendar/feed.ics", timeout=20)
    r.raise_for_status()
    return r.text

def build_plain_email():
    mid = f"<demo-{uuid.uuid4()}@example.com>"
    subject = "Project meeting Friday 10:00 AM for 45 minutes, Sloan 101"
    body = """Hi,

Let's meet to discuss the CS201 project.
Time: Friday at 10:00 AM for 45 minutes
Location: Sloan 101
Professor: Dr. Jane Doe

Thanks!
"""
    email = f"""From: Dr. Jane Doe <jdoe@univ.edu>
To: you@example.com
Subject: {subject}
Message-ID: {mid}
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

{body}
"""
    return email.encode("utf-8"), subject

def build_ics_email():
    mid = f"<demo-ics-{uuid.uuid4()}@example.com>"
    # Schedule 1 hour from now for 30 minutes
    start = datetime.now(timezone.utc) + timedelta(hours=1)
    end = start + timedelta(minutes=30)
    def fmt(dt: datetime):
        return dt.strftime("%Y%m%dT%H%M%SZ")
    ics = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mentra Demo//EN
BEGIN:VEVENT
UID:{uuid.uuid4()}
DTSTAMP:{fmt(datetime.now(timezone.utc))}
DTSTART:{fmt(start)}
DTEND:{fmt(end)}
SUMMARY:Demo Office Hours
LOCATION:Room 101
DESCRIPTION:Discuss project timeline
END:VEVENT
END:VCALENDAR
"""
    email = f"""From: Dr. Jane Doe <jdoe@univ.edu>
To: you@example.com
Subject: Office hours
Message-ID: {mid}
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary=XYZ

--XYZ
Content-Type: text/plain; charset=us-ascii

Let's meet to discuss.

--XYZ
Content-Type: text/calendar; method=REQUEST; charset=UTF-8

{ics}

--XYZ--
"""
    return email.encode("utf-8"), "Office hours"

def main():
    use_ics = os.environ.get("USE_ICS", os.environ.get("E2E_USE_ICS", "0")).strip() in ("1","true","yes")
    email_bytes, _ = (build_ics_email() if use_ics else build_plain_email())
    print(f"[cfg] BASE={BASE}")
    print("[1] Posting inbound email (signed)…")
    resp = post_inbound(email_bytes)
    print("Inbound:", resp)
    time.sleep(0.5)

    print("[2] Fetch pending proposals…")
    props = list_proposals("pending")
    if not props:
        print("No pending proposals found. Check signature, GEMINI_API_KEY, and logs.")
        sys.exit(1)
    pid = props[0]["id"]
    print("Proposal:", props[0])

    if not props[0].get("start") or not props[0].get("duration_min"):
        print("Proposal missing start/duration. Ensure Gemini is configured or try an ICS email.")
        sys.exit(2)

    print("[3] Confirm proposal…")
    resp2 = confirm(pid)
    print("Confirm:", resp2)
    time.sleep(0.5)

    print("[4] Verify ICS feed contains the event…")
    ics = feed()
    lines = [l for l in ics.splitlines() if any(k in l for k in ("SUMMARY","DTSTART","DTEND"))]
    print("\n".join(lines[:12]) or "(no event lines found)")
    print("Done.")

if __name__ == "__main__":
    try:
        main()
    except requests.HTTPError as e:
        print("HTTPError:", e, getattr(e, 'response', None) and e.response.text)
        sys.exit(3)