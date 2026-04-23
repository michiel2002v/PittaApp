import { useEffect, useState } from 'react'

interface OrderLine { id: string; itemName: string; sizeName: string; typeName: string; unitPriceCents: number; saucesText: string; remark: string | null }
interface MyOrder { id: string; deliveryDate: string; isPaid: boolean; notes: string | null; lines: OrderLine[]; totalCents: number; createdAt: string }

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(path, { ...init, headers, credentials: 'include' })
}
function cents(c: number) { return `€${(c / 100).toFixed(2)}` }

export function MyOrderHistory() {
  const [orders, setOrders] = useState<MyOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/orders/mine').then(r => r.ok ? r.json() : []).then(d => { setOrders(d); setLoading(false) })
  }, [])

  if (loading) return <section><h2>📜 Mijn bestellingen</h2><p>Laden…</p></section>

  const totalSpent = orders.reduce((s, o) => s + o.totalCents, 0)
  const unpaid = orders.filter(o => !o.isPaid).reduce((s, o) => s + o.totalCents, 0)

  return (
    <section>
      <h2>📜 Mijn bestellingen</h2>
      {orders.length === 0 ? <p>Je hebt nog geen bestellingen geplaatst.</p> : (
        <>
          <p>
            <strong>{orders.length} bestellingen</strong> — Totaal: {cents(totalSpent)}
            {unpaid > 0 && <span style={{ color: 'red' }}> — Openstaand: {cents(unpaid)}</span>}
          </p>
          <table style={tbl}>
            <thead>
              <tr><th>Datum</th><th>Items</th><th>Totaal</th><th>Betaald</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.deliveryDate}</td>
                  <td>
                    {o.lines.map((l, i) => (
                      <div key={i}>
                        {l.itemName} {l.sizeName} {l.typeName}
                        {l.saucesText ? ` (${l.saucesText})` : ''}
                        {l.remark ? ` — ${l.remark}` : ''}
                        <span style={{ color: '#6b7280', marginLeft: 6 }}>{cents(l.unitPriceCents)}</span>
                      </div>
                    ))}
                  </td>
                  <td><strong>{cents(o.totalCents)}</strong></td>
                  <td>{o.isPaid ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}

const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }
