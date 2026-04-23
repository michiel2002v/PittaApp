import { useEffect, useState } from 'react'
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

function LoginScreen() {
  const signIn = () => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/MicrosoftIdentity/Account/SignIn?returnUrl=${returnUrl}`
  }
  return (
    <main style={pageStyle}>
      <h1>🥙 Pitta Moestie</h1>
      <p>Log in met je Vintecc-account om te beginnen.</p>
      <button type="button" style={primaryButton} onClick={signIn}>
        Sign in with Microsoft
      </button>
    </main>
  )
}

function IbanOnboarding({ onSaved }: { onSaved: (me: MeResponse) => void }) {
  const [iban, setIban] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await api('/me/iban', {
        method: 'PUT',
        body: JSON.stringify({ iban }),
      })
      if (res.status === 422) {
        setError('Ongeldig IBAN-nummer (MOD-97 controle mislukt).')
        return
      }
      if (res.status === 409) {
        setError('Dit IBAN is al geregistreerd door een andere gebruiker.')
        return
      }
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
      <h2>Welkom! Eén ding nog…</h2>
      <p>Voer je IBAN in. Dit gebruiken we om je betalingen automatisch te koppelen.</p>
      <form onSubmit={submit}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          IBAN
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="BE68 5390 0754 7034"
            autoComplete="off"
            required
            style={inputStyle}
          />
        </label>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" disabled={submitting} style={primaryButton}>
          {submitting ? 'Opslaan…' : 'Opslaan'}
        </button>
      </form>
    </section>
  )
}

function Profile({ me, onRefresh }: { me: MeResponse; onRefresh: () => void }) {
  const [balance, setBalance] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [newIban, setNewIban] = useState(me.iban || '')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    api('/me/balance').then(r => r.ok ? r.json() : null).then(d => setBalance(d?.balanceCents ?? 0))
  }, [])

  const saveIban = async () => {
    setErr(null)
    const res = await api('/me/iban', { method: 'PUT', body: JSON.stringify({ iban: newIban }) })
    if (res.ok) { setEditing(false); onRefresh() }
    else {
      const e = await res.json().catch(() => null)
      setErr(e?.error ?? `HTTP ${res.status}`)
    }
  }

  const signOut = () => {
    window.location.href = '/MicrosoftIdentity/Account/SignOut'
  }
  const b = balance ?? 0
  return (
    <section>
      <h2>Profiel</h2>
      {balance !== null && (
        <div style={{
          padding: '1rem', marginBottom: 12, borderRadius: 8,
          background: b > 0 ? '#fee2e2' : b < 0 ? '#d1fae5' : '#f3f4f6',
          fontSize: '1.1rem', fontWeight: 'bold',
        }}>
          💶 Saldo: €{(Math.abs(b) / 100).toFixed(2)} {b > 0 ? '(te betalen)' : b < 0 ? '(tegoed)' : '(netjes!)'}
        </div>
      )}
      <ul style={{ lineHeight: 1.8 }}>
        <li><strong>Naam:</strong> {me.displayName}</li>
        <li><strong>E-mail:</strong> {me.email}</li>
        <li>
          <strong>IBAN:</strong>{' '}
          {editing ? (
            <>
              <input value={newIban} onChange={e => setNewIban(e.target.value)} style={{ fontFamily: 'monospace', padding: 4 }} />
              <button type="button" style={{ ...secondaryButton, padding: '0.3rem 0.6rem', marginLeft: 6 }} onClick={saveIban}>Opslaan</button>
              <button type="button" style={{ ...secondaryButton, padding: '0.3rem 0.6rem', marginLeft: 4 }} onClick={() => setEditing(false)}>X</button>
              {err && <div style={{ color: 'crimson' }}>{err}</div>}
            </>
          ) : (
            <>
              <code>{formatIban(me.iban)}</code>
              <button type="button" style={{ ...secondaryButton, padding: '0.2rem 0.5rem', marginLeft: 8, fontSize: '0.85rem' }} onClick={() => setEditing(true)}>Wijzig</button>
            </>
          )}
        </li>
        <li><strong>Rol:</strong> {me.isAdmin ? '👑 Admin' : 'Gebruiker'}</li>
      </ul>
      <button type="button" style={secondaryButton} onClick={signOut}>
        Uitloggen
      </button>
    </section>
  )
}

export default function App() {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [unauthenticated, setUnauthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api('/me/')
      .then(async (r) => {
        if (r.status === 401) {
          setUnauthenticated(true)
          return
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        setMe((await r.json()) as MeResponse)
      })
      .catch((e) => setError(String(e)))
  }, [])

  if (unauthenticated) return <LoginScreen />

  return (
    <main style={pageStyle}>
      <h1>🥙 Pitta Moestie</h1>
      {error && <p style={{ color: 'crimson' }}>API-fout: {error}</p>}
      {!me && !error && <p>Bezig met laden…</p>}
      {me && !me.iban && <IbanOnboarding onSaved={setMe} />}
      {me && me.iban && <Profile me={me} onRefresh={() => api('/me/').then(r => r.json()).then(setMe)} />}
      {me && me.iban && <PlaceOrder />}
      {me && me.iban && <MyOrderHistory />}
      {me && me.iban && me.isAdmin && <AdminOrderOverview />}
      {me && me.iban && me.isAdmin && <OrderRoundAdmin />}
      {me && me.iban && me.isAdmin && <CatalogAdmin />}
      {me && me.iban && me.isAdmin && <AdminPanel />}
    </main>
  )
}

function formatIban(iban: string | null): string {
  if (!iban) return '—'
  return iban.replace(/(.{4})/g, '$1 ').trim()
}

const pageStyle: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  padding: '2rem',
  maxWidth: 720,
  margin: '0 auto',
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 4,
  padding: '0.5rem',
  fontSize: '1rem',
  fontFamily: 'monospace',
}

const primaryButton: React.CSSProperties = {
  padding: '0.6rem 1.2rem',
  fontSize: '1rem',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
}

const secondaryButton: React.CSSProperties = {
  ...primaryButton,
  background: '#6b7280',
}
