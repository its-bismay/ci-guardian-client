export const API_BASE = import.meta.env.VITE_API_URL || '';

class ApiClient {
  async request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (res.status === 204) return null;
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Request failed');
    }
    return res.json();
  }

  get(path) { return this.request(path); }
  post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); }
  patch(path, body) { return this.request(path, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete(path) { return this.request(path, { method: 'DELETE' }); }
}

export const api = new ApiClient();
