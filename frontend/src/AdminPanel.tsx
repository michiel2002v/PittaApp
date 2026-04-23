import { useEffect, useState } from 'react'

interface AdminUser { id: string; displayName: string; email: string; iban: string | null; isAdmin: boolean; balanceCents: number }
interface CsvImport { id: string; fileName: string; uploadedAt: string; matchedCount: number; skippedCount: number }
interface Ranking { displayName: string; email: string; balanceCents: number; unpaidRoundCount: number; oldestDebitDate: string | null }

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(path, { ...init, headers, credentials: 'include' })
}
function cents(c: number) { return `€${(c / 100).toFixed(2)}` }

export function AdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [ranking, setRanking] = useState<Ranking[]>([])
  const [imports, setImports] = useState<CsvImport[]>([])
  const [tab, setTab] = useState<'users' | 'ranking' | 'imports' | 'print'>('users')
  const [msg, setMsg] = useState<string | null>(null)

  const loadAll = () => {
    api('/admin/users/').then(r => r.ok ? r.json() : []).then(setUsers)
    api('/admin/ranking').then(r => r.ok ? r.json() : []).then(setRanking)
    api('/admin/imports').then(r => r.ok ? r.json() : []).then(setImports)
  }
  useEffect(loadAll, [])

  const editIban = async (u: AdminUser) => {
    const newIban = prompt(`Nieuwe IBAN voor ${u.displayName}:`, u.iban || '')
    if (!newIban) return
    const res = await api(`/admin/users/${u.id}/iban`, { method: 'PUT', body: JSON.stringify({ iban: newIban }) })
    if (res.ok) { setMsg('IBAN bijgewerkt'); loadAll() }
    else { const e = await res.json().catch(() => null); setMsg(e?.error ?? 'Fout') }
  }

  const adjustBalance = async (u: AdminUser) => {
    const amountStr = prompt(`Bedrag in € voor ${u.displayName} (negatief = credit):`, '0')
    if (!amountStr) return
    const amount = parseFloat(amountStr.replace(',', '.'))
    if (isNaN(amount)) return
    const reason = prompt('Reden:')
    if (!reason) return
    const res = await api(`/admin/users/${u.id}/balance/adjust`, {
      method: 'POST', body: JSON.stringify({ amountCents: Math.round(amount * 100), reason }),
    })
    if (res.ok) { setMsg('Saldo aangepast'); loadAll() }
    else { setMsg('Fout bij aanpassen saldo') }
  }

  const uploadCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const fd = new FormData()
    fd.append('file', f)
    const res = await fetch('/admin/imports', { method: 'POST', body: fd, credentials: 'include' })
    const data = await res.json().catch(() => null)
    if (res.ok) {
      setMsg(`Import klaar: ${data.matchedCount} matched, ${data.skippedCount} skipped, ${data.unmatchedPittaRows?.length ?? 0} PITTA niet herkend`)
      loadAll()
    } else {
      setMsg(data?.error ?? 'Import mislukt')
    }
    e.target.value = ''
  }

  return (
    <section>
      <h2>⚙️ Admin Panel</h2>
      {msg && <p style={{ background: '#fef3c7', padding: 8, borderRadius: 6 }}>{msg}</p>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setTab('users')} style={{ ...tb, fontWeight: tab === 'users' ? 'bold' : 'normal' }}>👥 Gebruikers</button>
        <button onClick={() => setTab('ranking')} style={{ ...tb, fontWeight: tab === 'ranking' ? 'bold' : 'normal' }}>🏴‍☠️ Wanbetalers</button>
        <button onClick={() => setTab('imports')} style={{ ...tb, fontWeight: tab === 'imports' ? 'bold' : 'normal' }}>🏦 KBC imports</button>
        <button onClick={() => setTab('print')} style={{ ...tb, fontWeight: tab === 'print' ? 'bold' : 'normal' }}>🖨️ Dag overzicht</button>
      </div>

      {tab === 'users' && (
        <table style={tbl}>
          <thead><tr><th>Naam</th><th>Email</th><th>IBAN</th><th>Saldo</th><th>Acties</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.displayName}{u.isAdmin ? ' 👑' : ''}</td>
                <td>{u.email}</td>
                <td><code>{u.iban ?? '—'}</code></td>
                <td style={{ color: u.balanceCents > 0 ? 'red' : u.balanceCents < 0 ? 'green' : 'inherit', fontWeight: 'bold' }}>
                  {cents(u.balanceCents)}
                </td>
                <td>
                  <button type="button" style={smBtn} onClick={() => editIban(u)}>IBAN</button>{' '}
                  <button type="button" style={smBtn} onClick={() => adjustBalance(u)}>€ ±</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'ranking' && (
        ranking.length === 0 ? <p>Geen wanbetalers! 🎉</p> : (
          <table style={tbl}>
            <thead><tr><th>#</th><th>Naam</th><th>Schuld</th><th>Rondes</th><th>Oudste</th></tr></thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.email}>
                  <td>{i + 1}</td><td>{r.displayName}</td>
                  <td style={{ color: 'red', fontWeight: 'bold' }}>{cents(r.balanceCents)}</td>
                  <td>{r.unpaidRoundCount}</td>
                  <td>{r.oldestDebitDate ? new Date(r.oldestDebitDate).toLocaleDateString('nl-BE') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {tab === 'imports' && (
        <>
          <p>Upload een KBC CSV. Een betaling wordt gematcht op IBAN + "PITTA"/"PITA" in mededeling.</p>
          <input type="file" accept=".csv" onChange={uploadCsv} style={{ marginBottom: 12 }} />
          <table style={tbl}>
            <thead><tr><th>Bestand</th><th>Datum</th><th>Matched</th><th>Skipped</th></tr></thead>
            <tbody>
              {imports.map(i => (
                <tr key={i.id}>
                  <td>{i.fileName}</td>
                  <td>{new Date(i.uploadedAt).toLocaleString('nl-BE')}</td>
                  <td style={{ color: 'green' }}>{i.matchedCount}</td>
                  <td>{i.skippedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'print' && <DaySummary />}
    </section>
  )
}

function DaySummary() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [data, setData] = useState<DaySummaryData | null>(null)

  const load = async () => {
    const res = await api(`/admin/orders-by-date?date=${date}`)
    if (res.ok) setData(await res.json())
  }

  return (
    <>
      <label>Datum: <input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
      <button type="button" onClick={load} style={{ ...tb, marginLeft: 8 }}>Laden</button>
      {data && (
        <div style={{ marginTop: 12 }}>
          <h3>📋 Samenvatting voor {data.date}</h3>
          <p>{data.totalOrders} bestellingen — Totaal {cents(data.totalCents)}</p>
          <h4>Voor de pitta-zaak:</h4>
          <ul>
            {data.summary.map((s, i) => (
              <li key={i}><strong>{s.count}x</strong> {s.itemName} {s.sizeName} {s.typeName}</li>
            ))}
          </ul>
          <h4>Per besteller:</h4>
          <ul>
            {data.orders.map(o => (
              <li key={o.id}>
                <strong>{o.user}</strong> — {cents(o.totalCents)} {o.isPaid ? '✅' : '❌'}
                <ul>
                  {o.lines.map((l, i) => (
                    <li key={i}>{l.itemName} {l.sizeName} {l.typeName} {l.saucesText ? `(${l.saucesText})` : ''} {l.remark ? `— ${l.remark}` : ''}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => window.print()} style={tb}>🖨️ Print</button>
        </div>
      )}
    </>
  )
}

interface DaySummaryData {
  date: string; totalOrders: number; totalCents: number
  summary: { itemName: string; typeName: string; sizeName: string; count: number }[]
  orders: { id: string; user: string; totalCents: number; isPaid: boolean; notes: string | null
    lines: { itemName: string; sizeName: string; typeName: string; saucesText: string; remark: string | null }[]
  }[]
}

const tb: React.CSSProperties = { padding: '0.4rem 0.8rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }
const smBtn: React.CSSProperties = { padding: '0.2rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4 }
