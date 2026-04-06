const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, token ? { headers: { Authorization: `Bearer ${token}` } } : {}),

  post: <T>(path: string, data: unknown, token?: string) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    }),

  put: <T>(path: string, data: unknown, token?: string) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    }),
};
