const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// "Beni hatırla" açıksa localStorage (kalıcı), kapalıysa sessionStorage (tarayıcı kapanınca silinir).
const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';
const PERSIST = 'authPersist';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS) || sessionStorage.getItem(ACCESS);
}
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH) || sessionStorage.getItem(REFRESH);
}
export function setTokens(access: string, refresh: string, remember = true) {
  const store = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  store.setItem(ACCESS, access);
  store.setItem(REFRESH, refresh);
  other.removeItem(ACCESS);
  other.removeItem(REFRESH);
  localStorage.setItem(PERSIST, remember ? '1' : '0');
}
export function clearTokens() {
  [localStorage, sessionStorage].forEach((s) => { s.removeItem(ACCESS); s.removeItem(REFRESH); });
  localStorage.removeItem(PERSIST);
}

export async function apiFetch<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers, cache: 'no-store' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message || `İstek başarısız (${res.status})`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return data as T;
}

export const api = {
  get: <T = any>(p: string) => apiFetch<T>(p),
  post: <T = any>(p: string, body?: any) => apiFetch<T>(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(p: string, body?: any) => apiFetch<T>(p, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
};
