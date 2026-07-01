export function connectSSE(path, onEvent) {
  const BASE_URL = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('ci_guardian_token') || '';
  const url = `${BASE_URL}${path}?token=${encodeURIComponent(token)}`;
  const source = new EventSource(url);

  source.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent(data);
    } catch { /* ignore malformed */ }
  };

  source.onerror = () => {
    console.warn('SSE connection error, will auto-reconnect');
  };

  return () => source.close();
}
