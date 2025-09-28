import { ENV } from '../config/env';

export type TimelineResponse = {
  chunks: { id: string; text: string; bookmarked: boolean }[];
  assets: { id: string; path: string }[];
};

export type SummaryResponse = Record<string, any>;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${ENV.BACKEND_BASE.replace(/\/$/, '')}${path}`;
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
    Authorization: `Bearer ${ENV.API_BEARER_TOKEN}`,
  };
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  }
  return (await res.text()) as unknown as T;
}

export const Backend = {
  health(): Promise<{ status: string }> {
    return api('/health');
  },
  createSession(title: string): Promise<{ id: string; title: string }> {
    return api('/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
  },
  getTimeline(sid: string, params?: { q?: string; bookmarked?: boolean }): Promise<TimelineResponse> {
    const q = new URLSearchParams();
    if (params?.q) q.set('q', params.q);
    if (params?.bookmarked) q.set('bookmarked', 'true');
    const qs = q.toString();
    return api(`/sessions/${encodeURIComponent(sid)}/timeline${qs ? `?${qs}` : ''}`);
  },
  bookmarkRange(sid: string, tsStart: number, tsEnd: number, tag?: string): Promise<{ ok: boolean; tag?: string }> {
    const form = new FormData();
    form.set('ts_start', String(tsStart));
    form.set('ts_end', String(tsEnd));
    if (tag) form.set('tag', tag);
    return api(`/sessions/${encodeURIComponent(sid)}/bookmark`, {
      method: 'POST',
      body: form,
    });
  },
  generateSummary(sid: string): Promise<SummaryResponse> {
    return api(`/sessions/${encodeURIComponent(sid)}/summary:generate-sync`, { method: 'POST' });
  },
  listFlashcards(sid: string): Promise<{ id: string; type: string; question: string }[]> {
    return api(`/sessions/${encodeURIComponent(sid)}/flashcards`);
  },
  generateFlashcards(sid: string, types: string[] = ['qa'], maxPerType = 3): Promise<Record<string, any[]>> {
    return api(`/sessions/${encodeURIComponent(sid)}/flashcards:generate-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ types, max_per_type: maxPerType }),
    });
  },
};

export default Backend;
