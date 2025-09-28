# Noted

An end-to-end system for smart note-taking and studying:
- Glasses client (Mentra) to capture audio and photos, trigger actions, and talk to Gemini
- FastAPI backend with sessions, transcripts, flashcards/quizzes, calendar (ICS), AgentMail, and WebSockets
- Frontend web app (Vite + React/TS) for visualization and controls

## Repository structure

```
Noted/
├─ frontend/Noted Website/               # Vite + React web app
├─ mentra-backend/                       # FastAPI backend (SQLite + SQLAlchemy)
├─ Mentra/                               # Glasses client (Bun/TypeScript)
└─ uploads/                              # Local uploads (dev)
```

## Quick start

### Backend (FastAPI)

1) Dependencies
- Python 3.11+ (3.12 recommended)
- Install packages

```bash
cd mentra-backend
python -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
cp .env.example .env
# Edit .env and set at least: DATABASE_URL, API_BEARER_TOKEN, GEMINI_API_KEY (optional), AGENTMAIL_WEBHOOK_SECRET
```

2) Run API

```bash
uvicorn app.api.main:app --host 127.0.0.1 --port 8020 --reload
```

3) Optional: public tunnel for ICS/webhooks

```bash
cloudflared tunnel --url http://127.0.0.1:8020
# Or ngrok: ngrok http http://127.0.0.1:8020
```

4) Health check

http://127.0.0.1:8020/health → {"status":"ok"}

More backend details and endpoints in `mentra-backend/README.md`.

### Frontend (Vite + React)

```bash
cd "frontend/Noted Website"
npm install
npm run dev
# App typically on http://127.0.0.1:5173 (check console output)
```

Environment config lives in `frontend/Noted Website/src/config/env.ts` and `frontend/Noted Website/src/env.example`.

### Glasses client (Mentra)

The glasses client captures audio/photos and talks to the backend. It can wake on words, record, upload, and speak Gemini replies.

1) Requirements
- Bun or Node + TypeScript

2) Configure

Environment variables used by the client:
- BACKEND_API_URL: http://127.0.0.1:8020 (or your tunnel URL)
- BACKEND_API_TOKEN: devsecret123 (default; change to match backend)
- MENTRAOS_API_KEY: required for @mentra/sdk

3) Build/Run

```bash
cd Mentra
# If using Node: install deps and build
npm install
npx tsc -p tsconfig.json
# Start your device app flow, or run watchers with Bun if installed:
# bun --watch src/index.ts

# E2E runners:
# Minimal test to backend (silent wav + tiny PNG)
# bun --watch src/glasses_backend.test.ts
# Or custom files:
# BACKEND_API_URL=http://127.0.0.1:8020 BACKEND_API_TOKEN=devsecret123 \
# WAV=/path/to.wav IMG=/path/to.png bun --watch src/e2e.ts
```

The app will:
- Create a backend session on “start session”
- Upload audio WAV to `/sessions/{sid}/transcribe` → backend uses Gemini to transcribe and stores a transcript chunk
- Upload images to `/sessions/{sid}/assets` → backend analyzes via Gemini Vision/OCR and stores `[image-notes] ...` in transcript
- Subscribe to `/ws/notify` to receive events (e.g., assistant replies) and speak responses

## Features

- Sessions, timeline, bookmarks
- Flashcards generation and quizzes via Gemini
- Summaries via Gemini
- ICS calendar feed and `/calendar/add`
- AgentMail: secure inbound email with HMAC → proposal → confirm to calendar
- WebSockets: live-audio streaming and notify bus
- MCP server for tool integrations

## Calendar subscription

- URL: `https://<your-tunnel>/calendar/feed.ics`
- Refresh every 5–15 minutes depending on client

## AgentMail (email → proposal → confirm → ICS)

```bash
cd mentra-backend
export BASE="https://<tunnel>"         # or http://127.0.0.1:8020
export AGENTMAIL_WEBHOOK_SECRET=your-secret
export API_BEARER_TOKEN=devsecret123
export USE_ICS=1                       # use ICS path for reliability
python scripts/agentmail_e2e.py
```

## Tests

Backend tests (pytest):
```bash
cd mentra-backend
pytest -q
```

Glasses quick E2E (Bun watcher scripts):
```bash
cd Mentra
# bun --watch src/glasses_backend.test.ts
# bun --watch src/e2e.ts
```

## Troubleshooting

- No LLM outputs: check GEMINI_API_KEY, GEMINI_MODEL, and DEV_FAKE_LLM=0 in backend .env
- Session 404 on uploads: the glasses client now creates/uses a backend session automatically
- ICS not appearing: verify you subscribed to the tunnel URL and your event exists in `/calendar/feed.ics`
- Webhooks 401: set AGENTMAIL_WEBHOOK_SECRET and include `X-Agentmail-Signature`

## License

Proprietary — internal use for Mentra/Noted.
