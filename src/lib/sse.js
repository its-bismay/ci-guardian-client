export function connectSSE(path, onEvent) {
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const url = `${BASE_URL}${path}`;
  const source = new EventSource(url, { withCredentials: true });

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
