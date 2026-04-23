import { useCallback, useEffect, useState } from 'react'

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(path, { ...init, headers, credentials: 'include' })
}

interface AdminItem { id: string; name: string; sortOrder: number; deletedAt: string | null }
interface AdminSauce { id: string; name: string; sortOrder: number; deletedAt: string | null }

interface MenuResponse {
  items: {
    id: string
    name: string
    sizes: { id: string; name: string; priceCents: number }[]
    types: { id: string; name: string; surchargeCents: number }[]
  }[]
  sauces: { id: string; name: string }[]
}

export function CatalogAdmin() {
  const [menu, setMenu] = useState<MenuResponse | null>(null)
  const [items, setItems] = useState<AdminItem[]>([])
  const [sauces, setSauces] = useState<AdminSauce[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      const [menuRes, itemsRes, saucesRes] = await Promise.all([
        api('/menu'),
        api('/admin/catalog/items?includeDeleted=true'),
        api('/admin/catalog/sauces?includeDeleted=true'),
      ])
      if (!menuRes.ok || !itemsRes.ok || !saucesRes.ok) {
        throw new Error('Kan catalogus niet laden')
      }
      setMenu((await menuRes.json()) as MenuResponse)
      setItems((await itemsRes.json()) as AdminItem[])
      setSauces((await saucesRes.json()) as AdminSauce[])
    } catch (e) {
      setError(String(e))
    }
  }, [])

  useEffect(() => { void reload() }, [reload])

  return (
    <section>
      <h2>Catalogus-beheer</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <h3>Items</h3>
      <ItemsSection items={items} menu={menu} onChanged={reload} />

      <h3>Sauzen</h3>
      <SaucesSection sauces={sauces} onChanged={reload} />
    </section>
  )
}

function ItemsSection({ items, menu, onChanged }: {
  items: AdminItem[]
  menu: MenuResponse | null
  onChanged: () => void
}) {
  const [newName, setNewName] = useState('')

  const addItem = async () => {
    if (!newName.trim()) return
    const res = await api('/admin/catalog/items', {
      method: 'POST',
      body: JSON.stringify({ name: newName, sortOrder: items.length }),
    })
    if (res.ok) { setNewName(''); onChanged() }
  }

  const toggleDelete = async (item: AdminItem) => {
    const url = `/admin/catalog/items/${item.id}${item.deletedAt ? '/restore' : ''}`
    const method = item.deletedAt ? 'POST' : 'DELETE'
    const res = await api(url, { method })
    if (res.ok) onChanged()
  }

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item) => {
          const activeMenuItem = menu?.items.find((m) => m.id === item.id)
          return (
            <li key={item.id} style={{ marginBottom: 16, padding: 12, border: '1px solid #ddd', borderRadius: 6, opacity: item.deletedAt ? 0.5 : 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <strong style={{ flex: 1 }}>{item.name}</strong>
                <button type="button" style={smallButton} onClick={() => toggleDelete(item)}>
                  {item.deletedAt ? 'Herstellen' : 'Verwijderen'}
                </button>
              </div>
              {!item.deletedAt && (
                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <SizesEditor itemId={item.id} sizes={activeMenuItem?.sizes ?? []} onChanged={onChanged} />
                  <TypesEditor itemId={item.id} types={activeMenuItem?.types ?? []} onChanged={onChanged} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nieuw item (bijv. Pitta)"
          style={inputStyle}
        />
        <button type="button" style={smallPrimary} onClick={addItem}>+ Item</button>
      </div>
    </div>
  )
}

function SizesEditor({ itemId, sizes, onChanged }: {
  itemId: string
  sizes: { id: string; name: string; priceCents: number }[]
  onChanged: () => void
}) {
  const [name, setName] = useState('')
  const [priceEuros, setPriceEuros] = useState('')

  const add = async () => {
    const cents = Math.round(parseFloat(priceEuros) * 100)
    if (!name.trim() || isNaN(cents) || cents < 0) return
    const res = await api(`/admin/catalog/items/${itemId}/sizes`, {
      method: 'POST',
      body: JSON.stringify({ name, priceCents: cents, sortOrder: sizes.length }),
    })
    if (res.ok) { setName(''); setPriceEuros(''); onChanged() }
  }

  const remove = async (id: string) => {
    const res = await api(`/admin/catalog/sizes/${id}`, { method: 'DELETE' })
    if (res.ok) onChanged()
  }

  return (
    <div>
      <div style={subHeader}>Groottes</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {sizes.map((s) => (
          <li key={s.id} style={lineItem}>
            <span style={{ flex: 1 }}>{s.name}</span>
            <span>€{(s.priceCents / 100).toFixed(2)}</span>
            <button type="button" style={tinyButton} onClick={() => remove(s.id)}>✕</button>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <input style={mini} placeholder="Naam" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={mini} placeholder="€" value={priceEuros} onChange={(e) => setPriceEuros(e.target.value)} />
        <button type="button" style={tinyButton} onClick={add}>+</button>
      </div>
    </div>
  )
}

function TypesEditor({ itemId, types, onChanged }: {
  itemId: string
  types: { id: string; name: string; surchargeCents: number }[]
  onChanged: () => void
}) {
  const [name, setName] = useState('')
  const [surchargeEuros, setSurchargeEuros] = useState('')

  const add = async () => {
    const cents = surchargeEuros ? Math.round(parseFloat(surchargeEuros) * 100) : 0
    if (!name.trim() || isNaN(cents) || cents < 0) return
    const res = await api(`/admin/catalog/items/${itemId}/types`, {
      method: 'POST',
      body: JSON.stringify({ name, surchargeCents: cents, sortOrder: types.length }),
    })
    if (res.ok) { setName(''); setSurchargeEuros(''); onChanged() }
  }

  const remove = async (id: string) => {
    const res = await api(`/admin/catalog/types/${id}`, { method: 'DELETE' })
    if (res.ok) onChanged()
  }

  return (
    <div>
      <div style={subHeader}>Types</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {types.map((t) => (
          <li key={t.id} style={lineItem}>
            <span style={{ flex: 1 }}>{t.name}</span>
            <span>{t.surchargeCents > 0 ? `+€${(t.surchargeCents / 100).toFixed(2)}` : '—'}</span>
            <button type="button" style={tinyButton} onClick={() => remove(t.id)}>✕</button>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <input style={mini} placeholder="Naam" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={mini} placeholder="+€" value={surchargeEuros} onChange={(e) => setSurchargeEuros(e.target.value)} />
        <button type="button" style={tinyButton} onClick={add}>+</button>
      </div>
    </div>
  )
}

function SaucesSection({ sauces, onChanged }: { sauces: AdminSauce[]; onChanged: () => void }) {
  const [name, setName] = useState('')

  const add = async () => {
    if (!name.trim()) return
    const res = await api('/admin/catalog/sauces', {
      method: 'POST',
      body: JSON.stringify({ name, sortOrder: sauces.length }),
    })
    if (res.ok) { setName(''); onChanged() }
  }

  const toggle = async (s: AdminSauce) => {
    if (s.deletedAt) return
    const res = await api(`/admin/catalog/sauces/${s.id}`, { method: 'DELETE' })
    if (res.ok) onChanged()
  }

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sauces.map((s) => (
          <li key={s.id} style={{ ...lineItem, opacity: s.deletedAt ? 0.5 : 1 }}>
            <span style={{ flex: 1 }}>{s.name}</span>
            {!s.deletedAt && <button type="button" style={tinyButton} onClick={() => toggle(s)}>✕</button>}
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={inputStyle} placeholder="Nieuwe saus" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" style={smallPrimary} onClick={add}>+ Saus</button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { flex: 1, padding: '0.4rem', fontSize: '0.95rem' }
const mini: React.CSSProperties = { flex: 1, padding: '0.2rem 0.4rem', fontSize: '0.85rem', minWidth: 0 }
const smallPrimary: React.CSSProperties = { padding: '0.4rem 0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }
const smallButton: React.CSSProperties = { padding: '0.3rem 0.6rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem' }
const tinyButton: React.CSSProperties = { padding: '0.15rem 0.4rem', background: '#e5e7eb', border: '1px solid #d1d5db', borderRadius: 3, cursor: 'pointer', fontSize: '0.8rem' }
const lineItem: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', fontSize: '0.9rem' }
const subHeader: React.CSSProperties = { fontWeight: 600, fontSize: '0.85rem', color: '#4b5563', marginBottom: 4 }
