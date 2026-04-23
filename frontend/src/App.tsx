import { useEffect, useState } from 'react'
import { CatalogAdmin } from './CatalogAdmin'
import { OrderRoundAdmin } from './OrderRoundAdmin'

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

function Profile({ me }: { me: MeResponse }) {
  const signOut = () => {
    window.location.href = '/MicrosoftIdentity/Account/SignOut'
  }
  return (
    <section>
      <h2>Profiel</h2>
      <ul style={{ lineHeight: 1.8 }}>
        <li><strong>Naam:</strong> {me.displayName}</li>
        <li><strong>E-mail:</strong> {me.email}</li>
        <li><strong>IBAN:</strong> <code>{formatIban(me.iban)}</code></li>
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
      {me && me.iban && <Profile me={me} />}
      {me && me.iban && me.isAdmin && <OrderRoundAdmin />}
      {me && me.iban && me.isAdmin && <CatalogAdmin />}
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
