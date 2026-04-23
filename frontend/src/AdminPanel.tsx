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

  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'users', label: '👥 Gebruikers' },
    { key: 'ranking', label: '🏴‍☠️ Wanbetalers' },
    { key: 'imports', label: '🏦 KBC imports' },
    { key: 'print', label: '🖨️ Dag overzicht' },
  ]

  return (
    <section>
      <h2>⚙️ Admin panel</h2>
      {msg && <div className="alert alert-info">{msg}</div>}

      <nav className="tab-nav" style={{ marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button key={t.key} type="button" className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'users' && (
        <table>
          <thead><tr><th>Naam</th><th>E-mail</th><th>IBAN</th><th style={{ textAlign: 'right' }}>Saldo</th><th>Acties</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <strong>{u.displayName}</strong>
                  {u.isAdmin && <span className="badge badge-admin" style={{ marginLeft: 6 }}>👑</span>}
                </td>
                <td style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                <td><code>{u.iban ?? '—'}</code></td>
                <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)', color: u.balanceCents > 0 ? 'var(--color-danger)' : u.balanceCents < 0 ? 'var(--color-success)' : 'inherit' }}>
                  {cents(u.balanceCents)}
                </td>
                <td>
                  <button type="button" onClick={() => editIban(u)} style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>IBAN</button>{' '}
                  <button type="button" onClick={() => adjustBalance(u)} style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>€ ±</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'ranking' && (
        ranking.length === 0
          ? <div className="alert alert-success">🎉 Geen wanbetalers! Iedereen is netjes.</div>
          : (
            <table>
              <thead><tr><th>#</th><th>Naam</th><th style={{ textAlign: 'right' }}>Openstaand</th><th>Rondes</th><th>Oudste schuld</th></tr></thead>
              <tbody>
                {ranking.map((r, i) => (
                  <tr key={r.email}>
                    <td><span className="badge badge-warning">#{i + 1}</span></td>
                    <td><strong>{r.displayName}</strong><div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{r.email}</div></td>
                    <td style={{ textAlign: 'right', color: 'var(--color-danger)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{cents(r.balanceCents)}</td>
                    <td>{r.unpaidRoundCount}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{r.oldestDebitDate ? new Date(r.oldestDebitDate).toLocaleDateString('nl-BE') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      )}

      {tab === 'imports' && (
        <>
          <p style={{ color: 'var(--color-text-muted)' }}>Upload een KBC CSV-export. Betalingen worden gematcht op IBAN + "PITTA"/"PITA" in de vrije mededeling.</p>
          <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius)', border: '1px dashed var(--color-border-strong)' }}>
            <input type="file" accept=".csv" onChange={uploadCsv} />
          </div>
          <table>
            <thead><tr><th>Bestand</th><th>Datum</th><th style={{ textAlign: 'right' }}>Gematcht</th><th style={{ textAlign: 'right' }}>Overgeslagen</th></tr></thead>
            <tbody>
              {imports.map(i => (
                <tr key={i.id}>
                  <td><code>{i.fileName}</code></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{new Date(i.uploadedAt).toLocaleString('nl-BE')}</td>
                  <td style={{ textAlign: 'right' }}><span className="badge badge-success">✓ {i.matchedCount}</span></td>
                  <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{i.skippedCount}</td>
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
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          Datum:
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
        </label>
        <button type="button" className="btn-primary" onClick={load}>Laden</button>
      </div>
      {data && (
        <div className="print-section">
          <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-accent-soft) 100%)', borderRadius: 'var(--radius)', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0 }}>📋 Samenvatting voor {new Date(data.date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
              <strong>{data.totalOrders}</strong> bestellingen · totaal <strong>{cents(data.totalCents)}</strong>
            </div>
          </div>

          <h4>🥙 Voor de pitta-zaak</h4>
          <table style={{ marginBottom: '1.5rem' }}>
            <tbody>
              {data.summary.map((s, i) => (
                <tr key={i}>
                  <td style={{ width: 60, textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{s.count}×</td>
                  <td>{s.itemName} {s.sizeName} <span style={{ color: 'var(--color-text-muted)' }}>{s.typeName}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>👥 Per besteller</h4>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {data.orders.map(o => (
              <div key={o.id} style={{ padding: '0.75rem 1rem', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong>{o.user}</strong>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', marginRight: 8 }}>{cents(o.totalCents)}</span>
                    {o.isPaid
                      ? <span className="badge badge-success">✓ Betaald</span>
                      : <span className="badge badge-warning">Openstaand</span>}
                  </div>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  {o.lines.map((l, i) => (
                    <li key={i}>
                      {l.itemName} {l.sizeName} {l.typeName}
                      {l.saucesText ? <> · <em>{l.saucesText}</em></> : null}
                      {l.remark ? <> — <em>{l.remark}</em></> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button type="button" className="btn-primary" onClick={() => window.print()} style={{ marginTop: '1.25rem' }}>🖨️ Print</button>
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


