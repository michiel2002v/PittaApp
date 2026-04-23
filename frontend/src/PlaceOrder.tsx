import { useEffect, useState, useCallback } from 'react'

// ── types ──────────────────────────────────────────────────────
interface MenuSize { id: string; name: string; priceCents: number }
interface MenuType { id: string; name: string; surchargeCents: number }
interface MenuItem { id: string; name: string; sizes: MenuSize[]; types: MenuType[] }
interface MenuSauce { id: string; name: string }
interface MenuResponse { items: MenuItem[]; sauces: MenuSauce[] }

interface OrderLineResponse {
  id: string; itemId: string; itemName: string
  itemSizeId: string; sizeName: string
  itemTypeId: string; typeName: string
  unitPriceCents: number; saucesText: string; remark: string | null
}
interface OrderResponse {
  id: string; orderRoundId: string; status: string; isPaid: boolean; notes: string | null
  lines: OrderLineResponse[]; totalCents: number; createdAt: string; updatedAt: string
}

interface Round {
  id: string; deliveryDate: string; cutoffAt: string
  status: string; effectiveStatus: string; isAcceptingOrders: boolean; notes: string | null
}

// ── helpers ────────────────────────────────────────────────────
async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(path, { ...init, headers, credentials: 'include' })
}

function cents(c: number) { return `€${(c / 100).toFixed(2)}` }

// ── component ──────────────────────────────────────────────────
export function PlaceOrder() {
  const [round, setRound] = useState<Round | null>(null)
  const [menu, setMenu] = useState<MenuResponse | null>(null)
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // line builder state
  const [selItem, setSelItem] = useState('')
  const [selSize, setSelSize] = useState('')
  const [selType, setSelType] = useState('')
  const [selSauces, setSelSauces] = useState<string[]>([])
  const [lineRemark, setLineRemark] = useState('')
  const [lines, setLines] = useState<LineInput[]>([])
  const [orderNotes, setOrderNotes] = useState('')
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)

  type LineInput = {
    itemSizeId: string; itemTypeId: string; sauceIds: string[]
    remark: string; displayItem: string; displaySize: string; displayType: string
    displaySauces: string; displayPrice: number
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const roundRes = await api('/order-rounds/current')
      if (roundRes.status === 204) { setRound(null); return }
      const r = await roundRes.json() as Round
      setRound(r)

      const [menuRes, orderRes] = await Promise.all([
        api('/menu'),
        api(`/orders/round/${r.id}`),
      ])
      if (menuRes.ok) setMenu(await menuRes.json() as MenuResponse)
      if (orderRes.ok) {
        const existing = await orderRes.json() as OrderResponse
        setOrder(existing)
        setOrderNotes(existing.notes ?? '')
      }
    } catch (e) { setError(String(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // When item changes, reset size/type
  const currentItem = menu?.items.find(i => i.id === selItem)
  const handleItemChange = (id: string) => {
    setSelItem(id)
    setSelSize('')
    setSelType('')
    setSelSauces([])
  }

  const currentSize = currentItem?.sizes.find(s => s.id === selSize)
  const currentType = currentItem?.types.find(t => t.id === selType)
  const linePrice = currentSize && currentType
    ? Math.max(0, currentSize.priceCents + currentType.surchargeCents) : 0

  const addLine = () => {
    if (!currentItem || !currentSize || !currentType) return
    const sauceNames = (menu?.sauces ?? []).filter(s => selSauces.includes(s.id)).map(s => s.name)
    setLines(prev => [...prev, {
      itemSizeId: currentSize.id, itemTypeId: currentType.id, sauceIds: [...selSauces],
      remark: lineRemark.trim(), displayItem: currentItem.name, displaySize: currentSize.name,
      displayType: currentType.name, displaySauces: sauceNames.join(', '), displayPrice: linePrice,
    }])
    // reset for next line
    setSelSize('')
    setSelType('')
    setSelSauces([])
    setLineRemark('')
  }

  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx))

  const submit = async () => {
    if (!round || lines.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const body = {
        orderRoundId: round.id,
        lines: lines.map(l => ({
          itemSizeId: l.itemSizeId, itemTypeId: l.itemTypeId,
          sauceIds: l.sauceIds, remark: l.remark || null,
        })),
        notes: orderNotes.trim() || null,
      }
      const targetId = editingOrderId ?? order?.id
      const isUpdate = !!targetId
      const res = isUpdate
        ? await api(`/orders/${targetId}`, { method: 'PUT', body: JSON.stringify(body) })
        : await api('/orders', { method: 'POST', body: JSON.stringify(body) })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setError(err?.error ?? `HTTP ${res.status}`)
        return
      }
      const saved = await res.json() as OrderResponse
      setOrder(saved)
      setLines([])
      setEditingOrderId(null)
    } catch (e) { setError(String(e)) }
    finally { setSaving(false) }
  }

  const deleteOrder = async () => {
    if (!order) return
    setSaving(true)
    try {
      const res = await api(`/orders/${order.id}`, { method: 'DELETE' })
      if (res.ok || res.status === 204) { setOrder(null); setLines([]) }
      else { const err = await res.json().catch(() => null); setError(err?.error ?? 'Verwijderen mislukt') }
    } catch (e) { setError(String(e)) }
    finally { setSaving(false) }
  }

  const toggleSauce = (id: string) => {
    setSelSauces(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  // ── render ─────────────────────────────────────────────────────
  if (loading) return <section><h2>🥙 Bestelling</h2><p>Laden…</p></section>
  if (!round) return <section><h2>🥙 Bestelling</h2><p>Geen open bestelronde op dit moment.</p></section>

  const cutoff = new Date(round.cutoffAt)
  const delivery = round.deliveryDate

  return (
    <section>
      <h2>🥙 Bestelling</h2>
      <p>
        <strong>Levering:</strong> {delivery} &nbsp;|&nbsp;
        <strong>Deadline:</strong> {cutoff.toLocaleString('nl-BE')} &nbsp;|&nbsp;
        <strong>Status:</strong> {round.effectiveStatus}
      </p>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {/* Existing order display */}
      {order && (
        <div style={cardStyle}>
          <h3>Jouw bestelling ({order.status === 'Open' ? 'te wijzigen' : order.status})</h3>
          <table style={tableStyle}>
            <thead>
              <tr><th>Item</th><th>Maat</th><th>Type</th><th>Sauzen</th><th>Prijs</th><th>Opmerking</th></tr>
            </thead>
            <tbody>
              {order.lines.map(l => (
                <tr key={l.id}>
                  <td>{l.itemName}</td><td>{l.sizeName}</td><td>{l.typeName}</td>
                  <td>{l.saucesText || '—'}</td><td>{cents(l.unitPriceCents)}</td>
                  <td>{l.remark || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p><strong>Totaal: {cents(order.totalCents)}</strong>{order.notes ? ` — ${order.notes}` : ''}</p>
          {round.isAcceptingOrders && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" style={primaryBtn} onClick={() => {
                if (!order || !menu) return
                // Preload existing order lines into the builder, then hide the summary.
                setEditingOrderId(order.id)
                setOrderNotes(order.notes ?? '')
                const preloaded: LineInput[] = order.lines.map(l => {
                  const item = menu.items.find(i => i.sizes.some(s => s.id === l.itemSizeId))
                  const size = item?.sizes.find(s => s.id === l.itemSizeId)
                  const type = item?.types.find(t => t.id === l.itemTypeId)
                  return {
                    itemSizeId: l.itemSizeId,
                    itemTypeId: l.itemTypeId,
                    sauceIds: [],
                    remark: l.remark ?? '',
                    displayItem: l.itemName,
                    displaySize: l.sizeName,
                    displayType: l.typeName,
                    displaySauces: l.saucesText,
                    displayPrice: (size?.priceCents ?? 0) + (type?.surchargeCents ?? 0),
                  }
                })
                setLines(preloaded)
                setOrder(null)
              }}>
                Wijzigen
              </button>
              <button type="button" style={dangerBtn} onClick={deleteOrder} disabled={saving}>
                Annuleren
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order builder — show when no existing order or editing */}
      {!order && round.isAcceptingOrders && menu && (
        <div style={cardStyle}>
          <h3>{editingOrderId ? 'Bestelling wijzigen' : lines.length > 0 ? 'Bestelling aanpassen' : 'Nieuwe bestelling'}</h3>

          {/* Line items already added */}
          {lines.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr><th>Item</th><th>Maat</th><th>Type</th><th>Sauzen</th><th>Prijs</th><th></th></tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i}>
                    <td>{l.displayItem}</td><td>{l.displaySize}</td><td>{l.displayType}</td>
                    <td>{l.displaySauces || '—'}</td><td>{cents(l.displayPrice)}</td>
                    <td><button type="button" onClick={() => removeLine(i)} style={smallBtn}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Add a line */}
          <fieldset style={{ border: '1px solid var(--color-border, #ddd)', padding: '1rem', borderRadius: 'var(--radius, 8px)', marginTop: 8 }}>
            <legend><strong>Item toevoegen</strong></legend>

            {/* Item tiles */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>Kies een item</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {menu.items.map(i => (
                  <button
                    key={i.id} type="button"
                    onClick={() => handleItemChange(i.id)}
                    style={{
                      ...tileStyle,
                      ...(selItem === i.id ? tileActiveStyle : {}),
                    }}
                  >
                    {i.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size tiles */}
            {currentItem && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>Maat</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {currentItem.sizes.map(s => (
                    <button
                      key={s.id} type="button"
                      onClick={() => setSelSize(s.id)}
                      style={{
                        ...tileStyle,
                        ...(selSize === s.id ? tileActiveStyle : {}),
                      }}
                    >
                      <span>{s.name}</span>
                      <span style={{ fontSize: '0.8rem', color: selSize === s.id ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted)' }}>{cents(s.priceCents)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type tiles */}
            {currentItem && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>Type</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {currentItem.types.map(t => (
                    <button
                      key={t.id} type="button"
                      onClick={() => setSelType(t.id)}
                      style={{
                        ...tileStyle,
                        ...(selType === t.id ? tileActiveStyle : {}),
                      }}
                    >
                      <span>{t.name}</span>
                      {t.surchargeCents !== 0 && (
                        <span style={{ fontSize: '0.8rem', color: selType === t.id ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted)' }}>
                          {t.surchargeCents > 0 ? '+' : ''}{cents(t.surchargeCents)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sauce tiles */}
            {currentItem && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>Sauzen (optioneel)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {menu.sauces.map(s => (
                    <button
                      key={s.id} type="button"
                      onClick={() => toggleSauce(s.id)}
                      style={{
                        ...tileStyle,
                        ...(selSauces.includes(s.id) ? tileActiveStyle : {}),
                        minWidth: 'auto',
                        padding: '0.4rem 0.85rem',
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Remark */}
            {currentItem && (
              <div style={{ marginTop: 4, marginBottom: 8 }}>
                <label>
                  Opmerking
                  <input type="text" value={lineRemark} onChange={e => setLineRemark(e.target.value)}
                    placeholder="bv. zonder sla" style={{ ...selectStyle, width: '100%' }} />
                </label>
              </div>
            )}

            {currentSize && currentType && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>Prijs: <strong>{cents(linePrice)}</strong></span>
                <button type="button" style={primaryBtn} onClick={addLine}>+ Toevoegen</button>
              </div>
            )}
          </fieldset>

          {/* Notes + submit */}
          {lines.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <label>
                Opmerkingen bij bestelling
                <input type="text" value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                  placeholder="bv. ik ben er pas om 12:30" style={{ ...selectStyle, width: '100%' }} />
              </label>
              <p><strong>Totaal: {cents(lines.reduce((s, l) => s + l.displayPrice, 0))}</strong></p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" style={primaryBtn} onClick={submit} disabled={saving}>
                  {saving ? 'Bezig…' : editingOrderId ? 'Wijzigingen opslaan' : 'Bestelling plaatsen'}
                </button>
                {editingOrderId && (
                  <button type="button" onClick={() => { setEditingOrderId(null); setLines([]); load() }}>
                    Annuleren
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!round.isAcceptingOrders && !order && (
        <p style={{ color: '#b45309' }}>De deadline is verstreken. Bestellen is niet meer mogelijk.</p>
      )}
    </section>
  )
}

// ── styles ─────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginTop: 12,
}
const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: 8,
}
const selectStyle: React.CSSProperties = {
  display: 'block', marginTop: 4, padding: '0.4rem', fontSize: '0.95rem',
}
const primaryBtn: React.CSSProperties = {
  padding: '0.5rem 1rem', background: '#2563eb', color: 'white',
  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem',
}
const dangerBtn: React.CSSProperties = {
  ...primaryBtn, background: '#dc2626',
}
const smallBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem',
}
const tileStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  padding: '0.6rem 1rem', minWidth: 90,
  background: 'var(--color-surface-alt, #f9fafb)',
  border: '2px solid var(--color-border, #e5e7eb)',
  borderRadius: 'var(--radius, 8px)',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem',
  transition: 'all 0.15s ease',
}
const tileActiveStyle: React.CSSProperties = {
  background: 'var(--color-primary, #c2410c)',
  borderColor: 'var(--color-primary, #c2410c)',
  color: '#fff',
}
