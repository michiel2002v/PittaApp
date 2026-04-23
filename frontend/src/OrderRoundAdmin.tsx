import { useCallback, useEffect, useState } from 'react'

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(path, { ...init, headers, credentials: 'include' })
}

interface OrderRound {
  id: string
  deliveryDate: string // YYYY-MM-DD
  cutoffAt: string // ISO
  status: string
  effectiveStatus: string
  isAcceptingOrders: boolean
  notes: string | null
  deliveredAt: string | null
}

export function OrderRoundAdmin() {
  const [rounds, setRounds] = useState<OrderRound[]>([])
  const [error, setError] = useState<string | null>(null)
  const [deliveryDate, setDeliveryDate] = useState('')
  const [cutoffAt, setCutoffAt] = useState('')
  const [notes, setNotes] = useState('')

  const reload = useCallback(async () => {
    setError(null)
    try {
      const res = await api('/order-rounds/')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRounds((await res.json()) as OrderRound[])
    } catch (e) {
      setError(String(e))
    }
  }, [])

  useEffect(() => { void reload() }, [reload])

  const create = async () => {
    setError(null)
    if (!deliveryDate || !cutoffAt) {
      setError('Vul bezorgdatum en cutoff in.')
      return
    }
    const body = {
      deliveryDate,
      cutoffAt: new Date(cutoffAt).toISOString(),
      notes: notes || null,
    }
    const res = await api('/admin/order-rounds/', { method: 'POST', body: JSON.stringify(body) })
    if (res.status === 422) {
      setError('Cutoff moet in de toekomst liggen.')
      return
    }
    if (!res.ok) { setError(`HTTP ${res.status}`); return }
    setDeliveryDate(''); setCutoffAt(''); setNotes('')
    await reload()
  }

  const act = async (id: string, action: 'lock' | 'deliver' | 'cancel') => {
    const res = await api(`/admin/order-rounds/${id}/${action}`, { method: 'POST' })
    if (res.ok) void reload()
    else setError(`HTTP ${res.status}`)
  }

  return (
    <section>
      <h2>Bestelrondes</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Nieuwe ronde</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <label>Bezorgdatum
            <input type="date" style={field} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
          </label>
          <label>Cutoff
            <input type="datetime-local" style={field} value={cutoffAt} onChange={(e) => setCutoffAt(e.target.value)} />
          </label>
        </div>
        <label>Notities
          <input type="text" style={field} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optioneel" />
        </label>
        <button type="button" style={primary} onClick={create}>+ Ronde aanmaken</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {rounds.map((r) => (
          <li key={r.id} style={{ padding: 12, marginBottom: 8, border: '1px solid #ddd', borderRadius: 6 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <strong style={{ flex: 1 }}>
                📅 {r.deliveryDate} — cutoff {new Date(r.cutoffAt).toLocaleString('nl-BE')}
              </strong>
              <span style={badge(r.effectiveStatus)}>{r.effectiveStatus}</span>
            </div>
            {r.notes && <p style={{ margin: '4px 0', color: '#4b5563' }}>{r.notes}</p>}
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {r.status === 'Open' && <button type="button" style={small} onClick={() => act(r.id, 'lock')}>🔒 Sluiten</button>}
              {r.status !== 'Delivered' && r.status !== 'Cancelled' && (
                <button type="button" style={small} onClick={() => act(r.id, 'deliver')}>🥙 Geleverd</button>
              )}
              {r.status !== 'Delivered' && r.status !== 'Cancelled' && (
                <button type="button" style={small} onClick={() => act(r.id, 'cancel')}>✕ Annuleren</button>
              )}
            </div>
          </li>
        ))}
        {rounds.length === 0 && <li style={{ color: '#6b7280' }}>Nog geen rondes.</li>}
      </ul>
    </section>
  )
}

const field: React.CSSProperties = { display: 'block', width: '100%', padding: '0.4rem', fontSize: '0.95rem', marginTop: 4 }
const primary: React.CSSProperties = { padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', marginTop: 8 }
const small: React.CSSProperties = { padding: '0.3rem 0.6rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem' }

function badge(status: string): React.CSSProperties {
  const colors: Record<string, string> = {
    Open: '#16a34a',
    Locked: '#d97706',
    Delivered: '#2563eb',
    Cancelled: '#6b7280',
  }
  return {
    padding: '0.15rem 0.5rem',
    background: colors[status] ?? '#6b7280',
    color: 'white',
    borderRadius: 4,
    fontSize: '0.8rem',
  }
}
