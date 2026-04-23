import { useEffect, useState } from 'react';

interface HealthResponse {
  status: string;
  database: string;
  timestamp: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5080';

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setHealth)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1>🥙 Pitta Moestie</h1>
      <p>Welcome. The frontend is running.</p>

      <h2>Backend health</h2>
      {error && <p style={{ color: 'crimson' }}>Error reaching API: {error}</p>}
      {!error && !health && <p>Checking…</p>}
      {health && (
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: 8 }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
      <p style={{ color: '#888', fontSize: '0.85rem' }}>API base: {API_BASE}</p>
    </main>
  );
}
