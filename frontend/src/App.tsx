import { useEffect, useState } from 'react'
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from '@azure/msal-react'
import { loginRequest } from './auth/msalConfig'
import { apiFetch } from './auth/apiClient'

interface MeResponse {
  id: string
  displayName: string
  email: string
  iban: string | null
  isAdmin: boolean
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5080'

function LoginScreen() {
  const { instance } = useMsal()
  return (
    <main style={pageStyle}>
      <h1>🥙 Pitta Moestie</h1>
      <p>Log in met je Vintecc-account om te beginnen.</p>
      <button
        type="button"
        style={primaryButton}
        onClick={() => instance.loginRedirect(loginRequest).catch(console.error)}
      >
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
      const res = await apiFetch('/me/iban', {
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
      const me = (await res.json()) as MeResponse
      onSaved(me)
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

function Profile({ me, onSignOut }: { me: MeResponse; onSignOut: () => void }) {
  return (
    <section>
      <h2>Profiel</h2>
      <ul style={{ lineHeight: 1.8 }}>
        <li><strong>Naam:</strong> {me.displayName}</li>
        <li><strong>E-mail:</strong> {me.email}</li>
        <li><strong>IBAN:</strong> <code>{formatIban(me.iban)}</code></li>
        <li><strong>Rol:</strong> {me.isAdmin ? '👑 Admin' : 'Gebruiker'}</li>
      </ul>
      <button type="button" style={secondaryButton} onClick={onSignOut}>
        Uitloggen
      </button>
    </section>
  )
}

function AuthedShell() {
  const { instance } = useMsal()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch('/me/')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<MeResponse>
      })
      .then(setMe)
      .catch((e) => setError(String(e)))
  }, [])

  const signOut = () => instance.logoutRedirect().catch(console.error)

  return (
    <main style={pageStyle}>
      <h1>🥙 Pitta Moestie</h1>
      {error && <p style={{ color: 'crimson' }}>API-fout: {error}</p>}
      {!me && !error && <p>Bezig met laden…</p>}
      {me && !me.iban && <IbanOnboarding onSaved={setMe} />}
      {me && me.iban && <Profile me={me} onSignOut={signOut} />}
    </main>
  )
}

export default function App() {
  return (
    <>
      <UnauthenticatedTemplate>
        <LoginScreen />
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <AuthedShell />
      </AuthenticatedTemplate>
      <footer style={{ position: 'fixed', bottom: 8, right: 12, color: '#aaa', fontSize: '0.75rem' }}>
        API: {API_BASE}
      </footer>
    </>
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
