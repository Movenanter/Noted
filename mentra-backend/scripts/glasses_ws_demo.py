#!/usr/bin/env python3
"""
Simulate the glasses device:
- Creates a session (or uses SID env)
- Streams audio bytes over WS /ws/sessions/{sid}/live-audio
- Sends a 'flush' to get final transcript
- Uploads an image asset to /sessions/{sid}/assets

Env vars:
  BASE (default http://127.0.0.1:8020)
  API_BEARER_TOKEN (default devsecret123)
  SID (optional; if not provided a new session is created)
  AUDIO (optional path to .wav; if not provided, sends zeros to trigger transcription)
  IMAGE (optional path to image to upload)
"""
import os, sys, time, json, pathlib
import requests, websockets, asyncio

BASE = os.environ.get("BASE", "http://127.0.0.1:8020").rstrip("/")
TOKEN = os.environ.get("API_BEARER_TOKEN", "devsecret123")


def create_session(title: str = "Glasses Demo") -> str:
    r = requests.post(f"{BASE}/sessions", headers={"Authorization": f"Bearer {TOKEN}"}, json={"title": title}, timeout=10)
    r.raise_for_status()
    return r.json()["id"]


async def stream_audio_ws(sid: str, audio_path: str | None = None):
    url = f"{BASE.replace('http', 'ws')}/ws/sessions/{sid}/live-audio"
    print(f"[WS] connecting {url}")
    async with websockets.connect(url, max_size=4*1024*1024) as ws:
        print("[WS] connected")
        # Prepare data
        if audio_path and pathlib.Path(audio_path).exists():
            data = pathlib.Path(audio_path).read_bytes()
        else:
            data = b"\x00" * 20000  # trigger threshold in server (>16000)
        # Send in chunks
        chunk = 4000
        for i in range(0, len(data), chunk):
            await ws.send(data[i:i+chunk])
            await asyncio.sleep(0.01)
        # Receive interim transcript
        msg = await asyncio.wait_for(ws.recv(), timeout=5)
        print("[WS] recv:", msg)
        # Flush
        await ws.send("flush")
        msg2 = await asyncio.wait_for(ws.recv(), timeout=5)
        print("[WS] flush recv:", msg2)


def upload_image_asset(sid: str, image_path: str):
    if not pathlib.Path(image_path).exists():
        print(f"[ASSET] file not found: {image_path}")
        return
    with open(image_path, "rb") as fh:
        r = requests.post(
            f"{BASE}/sessions/{sid}/assets",
            headers={"Authorization": f"Bearer {TOKEN}"},
            files={"file": (pathlib.Path(image_path).name, fh, "image/png")},
            timeout=20,
        )
        r.raise_for_status()
        print("[ASSET] uploaded:", r.json())


def main():
    sid = os.environ.get("SID") or create_session()
    print("[INFO] session:", sid)
    audio = os.environ.get("AUDIO")
    image = os.environ.get("IMAGE")
    asyncio.run(stream_audio_ws(sid, audio))
    if image:
        upload_image_asset(sid, image)
    # Show timeline
    r = requests.get(f"{BASE}/sessions/{sid}/timeline", headers={"Authorization": f"Bearer {TOKEN}"}, timeout=10)
    if r.ok:
        data = r.json()
        print("[TIMELINE] chunks:", len(data.get("chunks", [])), "assets:", len(data.get("assets", [])))


if __name__ == "__main__":
    main()
