import { useEffect, useMemo, useState } from 'react'
import { CatalogAdmin } from './CatalogAdmin'
import { OrderRoundAdmin } from './OrderRoundAdmin'
import { PlaceOrder } from './PlaceOrder'
import { MyOrderHistory } from './MyOrderHistory'
import { AdminOrderOverview } from './AdminOrderOverview'
import { AdminPanel } from './AdminPanel'

interface MeResponse {
  id: string
  displayName: string
  email: string
  iban: string | null
  isAdmin: boolean
}

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(path, { ...init, headers, credentials: 'include' })
}

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const signIn = () => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/MicrosoftIdentity/Account/SignIn?returnUrl=${returnUrl}`
  }
  return (
    <main>
      <section className="login-card">
        <div className="brand-mark">🥙</div>
        <h1>Pitta Moestie</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          De stijlvolste manier om te bestellen met je collega's.<br />
          Log in met je Vintecc-account.
        </p>
        <button type="button" className="btn-primary" onClick={signIn}>
          Aanmelden met Microsoft →
        </button>
      </section>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────
// IBAN onboarding
// ─────────────────────────────────────────────────────────────
function IbanOnboarding({ onSaved }: { onSaved: (me: MeResponse) => void }) {
  const [iban, setIban] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await api('/me/iban', { method: 'PUT', body: JSON.stringify({ iban }) })
      if (res.status === 422) { setError('Ongeldig IBAN-nummer (MOD-97 controle mislukt).'); return }
      if (res.status === 409) { setError('Dit IBAN is al geregistreerd door een andere gebruiker.'); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      onSaved((await res.json()) as MeResponse)
    } catch (err) {
      setError(String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h2>👋 Welkom! Eén ding nog…</h2>
      <p>Voer je IBAN in. We gebruiken dit om je betalingen automatisch te matchen via KBC.</p>
      <form onSubmit={submit} style={{ marginTop: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          IBAN
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="BE68 5390 0754 7034"
            autoComplete="off"
            required
            style={{ fontFamily: 'var(--font-mono)', marginTop: 4 }}
          />
        </label>
        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Bezig…' : 'IBAN opslaan'}
        </button>
      </form>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Balance hero card
// ─────────────────────────────────────────────────────────────
function BalanceHero({ balanceCents }: { balanceCents: number | null }) {
  if (balanceCents === null) return null
  const b = balanceCents
  const variant = b > 0 ? 'debt' : b < 0 ? 'credit' : ''
  const emoji = b > 0 ? '💸' : b < 0 ? '💰' : '✨'
  const label = b > 0 ? 'Openstaand bedrag' : b < 0 ? 'Jouw tegoed' : 'Saldo'
  const hint = b > 0
    ? 'Schrijf dit bedrag over met "PITTA" in de mededeling.'
    : b < 0
    ? 'Je hebt nog een tegoed staan voor een volgende ronde.'
    : 'Keurig netjes — niks openstaand. 🎉'

  return (
    <div className={`balance-hero ${variant}`}>
      <div>
        <div className="label">{label}</div>
        <div className="amount">€{(Math.abs(b) / 100).toFixed(2)}</div>
        <div className="hint">{hint}</div>
      </div>
      <div className="emoji" aria-hidden>{emoji}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Profile card
// ─────────────────────────────────────────────────────────────
function ProfileCard({ me, onRefresh }: { me: MeResponse; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false)
  const [newIban, setNewIban] = useState(me.iban || '')
  const [err, setErr] = useState<string | null>(null)

  const saveIban = async () => {
    setErr(null)
    const res = await api('/me/iban', { method: 'PUT', body: JSON.stringify({ iban: newIban }) })
    if (res.ok) { setEditing(false); onRefresh() }
    else {
      const e = await res.json().catch(() => null)
      setErr(e?.error ?? `HTTP ${res.status}`)
    }
  }

  return (
    <section>
      <h2>👤 Profiel</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: '0.75rem', columnGap: '1rem', alignItems: 'center' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Naam</div>
        <div style={{ fontWeight: 500 }}>{me.displayName}</div>

        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>E-mail</div>
        <div>{me.email}</div>

        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>IBAN</div>
        <div>
          {editing ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                value={newIban}
                onChange={e => setNewIban(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', maxWidth: 280 }}
              />
              <button type="button" className="btn-primary" onClick={saveIban}>Opslaan</button>
              <button type="button" onClick={() => setEditing(false)}>Annuleren</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <code>{formatIban(me.iban)}</code>
              <button type="button" onClick={() => setEditing(true)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}>Wijzigen</button>
            </div>
          )}
          {err && <div className="alert alert-error" style={{ marginTop: 8 }}>{err}</div>}
        </div>

        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Rol</div>
        <div>
          {me.isAdmin
            ? <span className="badge badge-admin">👑 Admin</span>
            : <span className="badge badge-info">Gebruiker</span>}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// App shell
// ─────────────────────────────────────────────────────────────
type Tab = 'order' | 'history' | 'admin'

export default function App() {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [unauthenticated, setUnauthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [tab, setTab] = useState<Tab>('order')

  const loadMe = () => api('/me/').then(r => r.json()).then(setMe)

  useEffect(() => {
    api('/me/')
      .then(async (r) => {
        if (r.status === 401) { setUnauthenticated(true); return }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        setMe((await r.json()) as MeResponse)
      })
      .catch((e) => setError(String(e)))
  }, [])

  useEffect(() => {
    if (me && me.iban) {
      api('/me/balance').then(r => r.ok ? r.json() : null).then(d => setBalance(d?.balanceCents ?? 0))
    }
  }, [me])

  const initials = useMemo(() => {
    if (!me) return ''
    return me.displayName
      .split(/\s+/)
      .map(s => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [me])

  if (unauthenticated) return <LoginScreen />

  const signOut = () => { window.location.href = '/MicrosoftIdentity/Account/SignOut' }
  const ready = !!me && !!me.iban

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <div className="brand-mark">🥙</div>
            <div>Pitta <em>Moestie</em></div>
          </div>
          {me && (
            <div className="user-pill">
              {balance !== null && (
                <span
                  className={`badge ${balance > 0 ? 'badge-danger' : balance < 0 ? 'badge-success' : 'badge-info'}`}
                  title={balance > 0 ? 'Openstaand bedrag' : balance < 0 ? 'Jouw tegoed' : 'Saldo'}
                >
                  €{(Math.abs(balance) / 100).toFixed(2)}
                </span>
              )}
              <span className="name">{me.displayName}{me.isAdmin ? ' 👑' : ''}</span>
              <div className="avatar" title={me.email}>{initials}</div>
              <button type="button" onClick={signOut} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                Uitloggen
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        {error && <div className="alert alert-error">API-fout: {error}</div>}

        {!me && !error && (
          <section style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-dots"><span /><span /><span /></div>
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Bezig met laden…</p>
          </section>
        )}

        {me && !me.iban && <IbanOnboarding onSaved={setMe} />}

        {ready && (
          <>
            <BalanceHero balanceCents={balance} />

            <nav className="tab-nav">
              <button type="button" className={tab === 'order' ? 'active' : ''} onClick={() => setTab('order')}>
                🥙 Bestellen
              </button>
              <button type="button" className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
                📜 Mijn geschiedenis
              </button>
              {me!.isAdmin && (
                <button type="button" className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}>
                  ⚙️ Admin
                </button>
              )}
            </nav>

            {tab === 'order' && (
              <>
                <PlaceOrder />
                <ProfileCard me={me!} onRefresh={loadMe} />
              </>
            )}

            {tab === 'history' && <MyOrderHistory />}

            {tab === 'admin' && me!.isAdmin && <AdminHome />}
          </>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>
        Made with 🌶️ at Vintecc
      </footer>
    </div>
  )
}

function formatIban(iban: string | null): string {
  if (!iban) return '—'
  return iban.replace(/(.{4})/g, '$1 ').trim()
}

// ─────────────────────────────────────────────────────────────
// Admin home — tile-based section navigation
// ─────────────────────────────────────────────────────────────
type AdminSection = 'orders' | 'rounds' | 'catalog' | 'users'

const ADMIN_TILES: { key: AdminSection; emoji: string; title: string; subtitle: string }[] = [
  { key: 'orders', emoji: '📋', title: 'Bestellingen', subtitle: 'Overzicht per ronde · betaalstatus' },
  { key: 'rounds', emoji: '🗓️', title: 'Bestelrondes', subtitle: 'Aanmaken · sluiten · leveringskosten · weekly' },
  { key: 'catalog', emoji: '🥙', title: 'Catalogus', subtitle: 'Items, maten, types & sauzen beheren' },
  { key: 'users', emoji: '⚙️', title: 'Gebruikers & financiën', subtitle: 'Saldo · IBAN · admins · wanbetalers · imports' },
]

function AdminHome() {
  const [section, setSection] = useState<AdminSection | null>(null)

  if (section === null) {
    return (
      <section>
        <h2>⚙️ Admin</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          Kies een sectie om te beheren.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {ADMIN_TILES.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSection(t.key)}
              style={{
                textAlign: 'left',
                padding: '1.25rem',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg, 12px)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--color-border)'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>{t.title}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t.subtitle}</div>
            </button>
          ))}
        </div>
      </section>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setSection(null)}
        style={{ marginBottom: '1rem', padding: '0.4rem 0.85rem', fontSize: '0.9rem' }}
      >
        ← Terug naar admin
      </button>
      {section === 'orders' && <AdminOrderOverview />}
      {section === 'rounds' && <OrderRoundAdmin />}
      {section === 'catalog' && <CatalogAdmin />}
      {section === 'users' && <AdminPanel />}
    </>
  )
}
