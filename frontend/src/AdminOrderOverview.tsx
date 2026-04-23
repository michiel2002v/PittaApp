import { useEffect, useState } from 'react'

interface Round { id: string; deliveryDate: string; status: string }
interface OrderLine { id: string; itemName: string; sizeName: string; typeName: string; unitPriceCents: number; saucesText: string; remark: string | null }
interface AdminOrder { id: string; userName: string; userEmail: string; isPaid: boolean; notes: string | null; lines: OrderLine[]; totalCents: number }
interface Wanbetaler { displayName: string; email: string; totalOpenCents: number; unpaidOrderCount: number; oldestUnpaidOrder: string }

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(path, { ...init, headers, credentials: 'include' })
}
function cents(c: number) { return `€${(c / 100).toFixed(2)}` }

export function AdminOrderOverview() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [selectedRound, setSelectedRound] = useState('')
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [wanbetalers, setWanbetalers] = useState<Wanbetaler[]>([])
  const [tab, setTab] = useState<'orders' | 'wanbetalers'>('orders')

  useEffect(() => {
    api('/order-rounds/').then(r => r.ok ? r.json() : []).then(setRounds)
    api('/admin/orders/wanbetalers').then(r => r.ok ? r.json() : []).then(setWanbetalers)
  }, [])

  useEffect(() => {
    if (!selectedRound) return
    api(`/admin/orders/round/${selectedRound}`).then(r => r.ok ? r.json() : []).then(setOrders)
  }, [selectedRound])

  const togglePaid = async (o: AdminOrder) => {
    const endpoint = o.isPaid ? 'unpay' : 'pay'
    const res = await api(`/admin/orders/${o.id}/${endpoint}`, { method: 'POST' })
    if (res.ok) {
      setOrders(prev => prev.map(x => x.id === o.id ? { ...x, isPaid: !x.isPaid } : x))
      // refresh wanbetalers
      api('/admin/orders/wanbetalers').then(r => r.ok ? r.json() : []).then(setWanbetalers)
    }
  }

  const totalRound = orders.reduce((s, o) => s + o.totalCents, 0)
  const paidRound = orders.filter(o => o.isPaid).reduce((s, o) => s + o.totalCents, 0)

  return (
    <section>
      <h2>📋 Bestellingen beheer</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setTab('orders')}
          style={{ ...tabBtn, fontWeight: tab === 'orders' ? 'bold' : 'normal' }}>Bestellingen</button>
        <button type="button" onClick={() => setTab('wanbetalers')}
          style={{ ...tabBtn, fontWeight: tab === 'wanbetalers' ? 'bold' : 'normal' }}>
          🏴‍☠️ Wanbetalers
        </button>
      </div>

      {tab === 'orders' && (
        <>
          <label>
            Ronde:
            <select value={selectedRound} onChange={e => setSelectedRound(e.target.value)} style={selStyle}>
              <option value="">— kies —</option>
              {rounds.map(r => (
                <option key={r.id} value={r.id}>{r.deliveryDate} ({r.status})</option>
              ))}
            </select>
          </label>

          {orders.length > 0 && (
            <>
              <p style={{ marginTop: 8 }}>
                <strong>{orders.length} bestellingen</strong> — Totaal: {cents(totalRound)} — Betaald: {cents(paidRound)} — Open: {cents(totalRound - paidRound)}
              </p>
              <table style={tbl}>
                <thead>
                  <tr><th>Naam</th><th>Items</th><th>Totaal</th><th>Betaald</th><th>Opmerking</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>{o.userName}</td>
                      <td>{o.lines.map(l => `${l.itemName} ${l.sizeName} ${l.typeName}`).join(', ')}</td>
                      <td>{cents(o.totalCents)}</td>
                      <td>
                        <button type="button" onClick={() => togglePaid(o)}
                          style={{ ...smallBtn, color: o.isPaid ? 'green' : 'red' }}>
                          {o.isPaid ? '✅' : '❌'}
                        </button>
                      </td>
                      <td>{o.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}

      {tab === 'wanbetalers' && (
        <>
          <h3>🏴‍☠️ Wanbetalers ranking</h3>
          {wanbetalers.length === 0 ? <p>Iedereen heeft betaald! 🎉</p> : (
            <table style={tbl}>
              <thead>
                <tr><th>#</th><th>Naam</th><th>Openstaand</th><th>Orders</th><th>Oudste</th></tr>
              </thead>
              <tbody>
                {wanbetalers.map((w, i) => (
                  <tr key={w.email}>
                    <td>{i + 1}</td><td>{w.displayName}</td>
                    <td style={{ color: 'red', fontWeight: 'bold' }}>{cents(w.totalOpenCents)}</td>
                    <td>{w.unpaidOrderCount}</td>
                    <td>{new Date(w.oldestUnpaidOrder).toLocaleDateString('nl-BE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  )
}

const tabBtn: React.CSSProperties = { padding: '0.4rem 0.8rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }
const selStyle: React.CSSProperties = { marginLeft: 8, padding: '0.4rem', fontSize: '0.95rem' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: 8 }
const smallBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }
