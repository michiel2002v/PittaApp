import { useEffect, useState } from 'react'

interface Round { id: string; deliveryDate: string; status: string }
interface OrderLine { id: string; itemName: string; sizeName: string; typeName: string; unitPriceCents: number; saucesText: string; remark: string | null }
interface AdminOrder { id: string; userName: string; userEmail: string; isPaid: boolean; notes: string | null; lines: OrderLine[]; totalCents: number }

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

  useEffect(() => {
    api('/order-rounds/').then(r => r.ok ? r.json() : []).then((rs: Round[]) => {
      setRounds(rs)
      if (rs.length > 0) setSelectedRound(prev => prev || rs[0].id)
    })
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
    }
  }

  const totalRound = orders.reduce((s, o) => s + o.totalCents, 0)
  const paidRound = orders.filter(o => o.isPaid).reduce((s, o) => s + o.totalCents, 0)

  return (
    <section>
      <h2>📋 Bestellingen per ronde</h2>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        Ronde:
        <select value={selectedRound} onChange={e => setSelectedRound(e.target.value)} style={{ width: 'auto', flex: 1, maxWidth: 380 }}>
          <option value="">— kies een ronde —</option>
          {rounds.map(r => (
            <option key={r.id} value={r.id}>
              {new Date(r.deliveryDate).toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' })} — {r.status}
            </option>
          ))}
        </select>
      </label>

      {selectedRound && orders.length === 0 && (
        <div className="alert alert-info">Nog geen bestellingen in deze ronde.</div>
      )}

      {orders.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <Stat label="Bestellingen" value={String(orders.length)} />
            <Stat label="Totaal" value={cents(totalRound)} />
            <Stat label="Betaald" value={cents(paidRound)} tone="success" />
            <Stat label="Open" value={cents(totalRound - paidRound)} tone={totalRound - paidRound > 0 ? 'danger' : 'muted'} />
          </div>

          {/* ── Copyable order summary for pitta shop ── */}
          <OrderSummaryText orders={orders} rounds={rounds} selectedRound={selectedRound} />

          <table>
            <thead>
              <tr><th>Naam</th><th>Items</th><th style={{ textAlign: 'right' }}>Totaal</th><th>Betaald</th><th>Opmerking</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.userName}</strong></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                    {o.lines.map(l => `${l.itemName} ${l.sizeName} ${l.typeName}`).join(', ')}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{cents(o.totalCents)}</td>
                  <td>
                    <button type="button" onClick={() => togglePaid(o)} style={{ padding: '0.25rem 0.7rem', fontSize: '0.8rem', background: 'transparent', border: 'none' }}>
                      {o.isPaid
                        ? <span className="badge badge-success">✓ Betaald</span>
                        : <span className="badge badge-warning">Openstaand</span>}
                    </button>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{o.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'danger' | 'muted' }) {
  const color =
    tone === 'success' ? 'var(--color-success)' :
    tone === 'danger' ? 'var(--color-danger)' :
    tone === 'muted' ? 'var(--color-text-muted)' : 'var(--color-text)'
  return (
    <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color, marginTop: 2 }}>{value}</div>
    </div>
  )
}

function OrderSummaryText({ orders, rounds, selectedRound }: { orders: AdminOrder[]; rounds: Round[]; selectedRound: string }) {
  const [copied, setCopied] = useState(false)

  const round = rounds.find(r => r.id === selectedRound)
  const dateStr = round
    ? new Date(round.deliveryDate).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  // Build aggregated line counts: "2× Pitta groot vlees, 1× Durum klein kip"
  const lineCounts: Record<string, number> = {}
  for (const o of orders) {
    for (const l of o.lines) {
      const desc = `${l.itemName} ${l.sizeName} ${l.typeName}${l.saucesText ? ` (${l.saucesText})` : ''}${l.remark ? ` — ${l.remark}` : ''}`
      lineCounts[desc] = (lineCounts[desc] || 0) + 1
    }
  }

  const lines = Object.entries(lineCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([desc, count]) => `${count}× ${desc}`)

  const summary = [
    `Bestelling Pitta Moestie — ${dateStr}`,
    `${orders.length} bestelling${orders.length !== 1 ? 'en' : ''}`,
    '',
    ...lines,
  ].join('\n')

  const copy = async () => {
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      marginBottom: '1.25rem',
      padding: '1rem',
      background: 'var(--color-surface-alt)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <strong>📝 Bestellingsoverzicht voor pitta zaak</strong>
        <button type="button" className="btn-primary" onClick={copy} style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}>
          {copied ? '✓ Gekopieerd!' : '📋 Kopiëren'}
        </button>
      </div>
      <textarea
        readOnly
        value={summary}
        style={{
          width: '100%',
          minHeight: 120,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.88rem',
          padding: '0.75rem',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          background: 'var(--color-surface)',
          resize: 'vertical',
        }}
        onFocus={e => e.target.select()}
      />
    </div>
  )
}
