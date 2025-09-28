const BASE = process.env.BACKEND_API_URL || 'http://127.0.0.1:8020'
const TOKEN = process.env.BACKEND_API_TOKEN || 'devsecret123'

async function createSession(title: string): Promise<string> {
  const r = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
  if (!r.ok) throw new Error(await r.text())
  const j = await r.json() as any
  return j.id
}

function makeSilentWav(durationSec = 1): Uint8Array {
  const sampleRate = 16000
  const numChannels = 1
  const bitsPerSample = 16
  const samples = durationSec * sampleRate
  const dataSize = samples * numChannels * (bitsPerSample / 8)
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)
  // RIFF
  view.setUint32(0, 0x46464952, true)
  view.setUint32(4, 36 + dataSize, true)
  view.setUint32(8, 0x45564157, true)
  // fmt
  view.setUint32(12, 0x20746d66, true)
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  // data
  view.setUint32(36, 0x61746164, true)
  view.setUint32(40, dataSize, true)
  // data section is already zeroed (silence)
  return new Uint8Array(buffer)
}

function tinyPng(): Uint8Array {
  // 1x1 transparent PNG
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}

async function run() {
  const sid = await createSession('Glasses Test E2E')

  // Upload audio (silent wav) — backend should still respond 200 with a text field
  const wav = makeSilentWav(1)
  const fdA = new FormData()
  const sliceA = (wav.buffer as ArrayBuffer).slice(wav.byteOffset, wav.byteOffset + wav.byteLength)
  fdA.append('file', new Blob([sliceA], { type: 'audio/wav' }), 'silent.wav')
  const ra = await fetch(`${BASE}/sessions/${sid}/transcribe`, { method: 'POST', headers: { 'Authorization': `Bearer ${TOKEN}` }, body: fdA })
  if (!ra.ok) throw new Error(`transcribe status ${ra.status}`)
  const ja = await ra.json() as any
  if (typeof ja.text !== 'string') throw new Error('transcribe: text not a string')

  // Upload tiny image asset
  const png = tinyPng()
  const fdI = new FormData()
  const sliceI = (png.buffer as ArrayBuffer).slice(png.byteOffset, png.byteOffset + png.byteLength)
  fdI.append('file', new Blob([sliceI], { type: 'image/png' }), 'p.png')
  const ri = await fetch(`${BASE}/sessions/${sid}/assets`, { method: 'POST', headers: { 'Authorization': `Bearer ${TOKEN}` }, body: fdI })
  if (!ri.ok) throw new Error(`assets status ${ri.status}`)

  // Timeline sanity
  const rt = await fetch(`${BASE}/sessions/${sid}/timeline`, { headers: { 'Authorization': `Bearer ${TOKEN}` } })
  if (!rt.ok) throw new Error(`timeline status ${rt.status}`)
  const tl = await rt.json() as any
  if (!Array.isArray(tl.assets)) throw new Error('timeline assets not array')
}

run().catch(e => { console.error(e); process.exit(1) })
