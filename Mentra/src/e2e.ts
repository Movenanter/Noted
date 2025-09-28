// Quick E2E runner for backend integration (audio+image upload)
import fs from 'fs'
import path from 'path'

const BASE = process.env.BACKEND_API_URL || 'http://127.0.0.1:8020'
const TOKEN = process.env.BACKEND_API_TOKEN || 'devsecret123'

async function ensureSession(title: string): Promise<string> {
  const r = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
  if (!r.ok) throw new Error(await r.text())
  const j = await r.json() as any
  return j.id
}

async function uploadAudio(sid: string, wavPath: string) {
  const data = fs.readFileSync(wavPath)
  const u8 = new Uint8Array(data.buffer as ArrayBuffer, data.byteOffset, data.byteLength)
  const slice = (u8.buffer as ArrayBuffer).slice(u8.byteOffset, u8.byteOffset + u8.byteLength)
  const fd = new FormData()
  fd.append('file', new Blob([slice], { type: 'audio/wav' }), path.basename(wavPath))
  const r = await fetch(`${BASE}/sessions/${sid}/transcribe`, { method: 'POST', headers: { 'Authorization': `Bearer ${TOKEN}` }, body: fd })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function uploadImage(sid: string, imgPath: string) {
  const data = fs.readFileSync(imgPath)
  const u8 = new Uint8Array(data.buffer as ArrayBuffer, data.byteOffset, data.byteLength)
  const slice = (u8.buffer as ArrayBuffer).slice(u8.byteOffset, u8.byteOffset + u8.byteLength)
  const fd = new FormData()
  fd.append('file', new Blob([slice], { type: 'image/png' }), path.basename(imgPath))
  const r = await fetch(`${BASE}/sessions/${sid}/assets`, { method: 'POST', headers: { 'Authorization': `Bearer ${TOKEN}` }, body: fd })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function timeline(sid: string) {
  const r = await fetch(`${BASE}/sessions/${sid}/timeline`, { headers: { 'Authorization': `Bearer ${TOKEN}` } })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function main() {
  const sid = await ensureSession('Mentra Glasses E2E')
  console.log('[sid]', sid)
  const wav = process.env.WAV || ''
  const img = process.env.IMG || ''
  if (wav && fs.existsSync(wav)) {
    const j = await uploadAudio(sid, wav)
    console.log('[transcribe]', j)
  }
  if (img && fs.existsSync(img)) {
    const j = await uploadImage(sid, img)
    console.log('[asset]', j)
  }
  const tl = await timeline(sid)
  console.log('[timeline] chunks:', tl?.chunks?.length, 'assets:', tl?.assets?.length)
}

main().catch(e => { console.error(e); process.exit(1) })
