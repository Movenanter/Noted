# Mentra Backend (FastAPI)

FastAPI backend powering Noted: sessions, transcripts, flashcards, quizzes, calendar (ICS), AgentMail webhook, and WebSockets for live audio + notifications.

## Quick start

- Requirements: Python 3.11+ (3.12 recommended)
- Create venv and install deps:

```bash
cd mentra-backend
python -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt
```

- Copy env and edit values:

```bash
cp .env.example .env
# edit .env to set DATABASE_URL, API_BEARER_TOKEN, GEMINI_API_KEY (optional), AGENTMAIL_WEBHOOK_SECRET, etc.
```

- Run the API:

```bash
uvicorn app.api.main:app --host 127.0.0.1 --port 8020 --reload
```

- Health check: http://127.0.0.1:8020/health → {"status":"ok"}

## Environment variables

See `.env.example` for a baseline. Common keys:

- DATABASE_URL: SQLite DSN; default `sqlite:///./mentra.db`
- API_BEARER_TOKEN: static bearer for protected endpoints and WS `token` query
- WEBHOOK_TOKEN: shared secret for `POST /webhooks/mentra`
- GEMINI_API_KEY, GEMINI_MODEL: Google Gemini config (optional)
- DEV_FAKE_LLM: 1 to bypass real LLM calls with deterministic outputs
- AGENTMAIL_WEBHOOK_SECRET: HMAC secret for `POST /email/inbound`
- BACKEND_BASE or BASE: base URL for scripts (e.g., tunnel HTTPS URL)
- REQUEST_TIMEOUT_SECONDS: LLM timeout seconds

## Public HTTPS (for ICS + webhooks)

You need a public HTTPS URL to:
- Subscribe your calendar client to `/calendar/feed.ics`
- Receive AgentMail webhooks at `/email/inbound`

Options:

- cloudflared (recommended):

```bash
brew install cloudflared
cloudflared tunnel --url http://127.0.0.1:8020
# copy the https URL printed (e.g., https://abc123.trycloudflare.com)
```

- ngrok:

```bash
# once: ngrok config add-authtoken <token>
ngrok http http://127.0.0.1:8020
```

## Calendar feed (ICS)

- Subscribe to: `https://<your-tunnel-domain>/calendar/feed.ics`
- Refresh: most clients auto-refresh every 5–15 minutes. Manual refresh may help during testing.
- Add via client of your choice (Apple Calendar, Google Calendar via URL, etc.).

Programmatic add (for tests):
- `POST /calendar/add` Authorization: `Bearer <API_BEARER_TOKEN>`
- Body: `{title, start (ISO8601), duration_min, location?, description?, tags?}`

## AgentMail pipeline (email → proposal → confirm → ICS)

- Inbound webhook: `POST /email/inbound`
  - Headers: `Content-Type: message/rfc822`, `X-Agentmail-Signature: <hmac_sha256(raw_email, AGENTMAIL_WEBHOOK_SECRET)>`
  - Prefers ICS attachment; falls back to Gemini extraction
- Proposals: `GET /proposals?status=pending` (Bearer)
- Confirm: `POST /proposals/{id}/confirm` (Bearer) → creates DB event visible in ICS feed
- Reject: `POST /proposals/{id}/reject` (Bearer)

### E2E script

Use the included script to drive the full flow:

```bash
# in a separate shell with the server running
cd mentra-backend
export BASE="https://<your-tunnel-domain>"   # or http://127.0.0.1:8020 locally
export AGENTMAIL_WEBHOOK_SECRET="your-secret"
export API_BEARER_TOKEN="devsecret123"
# ICS path (reliable):
export USE_ICS=1
python scripts/agentmail_e2e.py
```

Expected:
- Inbound ok → proposal created
- Confirm proposal → event_id returned
- ICS feed shows SUMMARY/DTSTART/DTEND for the event

If using plaintext instead of ICS,
- Ensure `GEMINI_API_KEY` is set and the subject/body clearly include time and duration
- Or set `DEV_FAKE_LLM=1` for deterministic demo outputs

## Glasses simulator

Simulates a device creating a session, streaming audio over WS, and optionally uploading an image asset:

```bash
cd mentra-backend
export BASE="http://127.0.0.1:8020"
export API_BEARER_TOKEN="devsecret123"
# Optional inputs
export AUDIO=/path/to/audio.wav   # if omitted, sends zeros to trigger transcript
export IMAGE=/path/to/image.png   # optional asset upload
python scripts/glasses_ws_demo.py
```

- WebSocket live audio: `ws://<BASE-host>/ws/sessions/{sid}/live-audio`
  - Send binary frames; send text `flush` to request final transcript
- Timeline: `GET /sessions/{sid}/timeline` (Bearer)

## Notifications WebSocket

- `ws(s)://<BASE-host>/ws/notify?token=<API_BEARER_TOKEN>`
- Receives JSON events for session created, chunks ingested, flashcards, proposals, confirmations, etc.

## Run tests

```bash
cd mentra-backend
pytest -q
```

## Notes

- For dev, tables auto-create on startup; for prod use Alembic migrations (`alembic/`)
- SQLite DB files live in this folder by default (`mentra.db`)
- MCP server exists under `app/mcp/server.py` for tool integrations (optional)
