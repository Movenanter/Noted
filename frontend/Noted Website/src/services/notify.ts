import { ENV } from '../config/env';

export type BackendEvent = {
  event_id: string;
  event_type: string;
  session_id?: string | null;
  message?: string | null;
  data?: Record<string, any>;
  created_at: string;
};

function toWsUrl(httpBase: string): string {
  try {
    const u = new URL(httpBase);
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    u.pathname = u.pathname.replace(/\/$/, '');
    return u.toString();
  } catch {
    // Fallback heuristic
    return httpBase.startsWith('https')
      ? httpBase.replace(/^https/, 'wss')
      : httpBase.replace(/^http/, 'ws');
  }
}

export function openNotifySocket(onEvent: (e: BackendEvent) => void): WebSocket {
  const base = ENV.BACKEND_BASE.replace(/\/$/, '');
  const wsBase = toWsUrl(base);
  const url = `${wsBase}/ws/notify?token=${encodeURIComponent(ENV.API_BEARER_TOKEN)}`;
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => {
    try {
      const e = JSON.parse(ev.data) as BackendEvent;
      onEvent(e);
    } catch {
      // ignore
    }
  };
  return ws;
}
