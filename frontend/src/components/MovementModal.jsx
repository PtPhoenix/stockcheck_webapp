import { useEffect, useState } from 'react'

import { createMovement } from '../lib/api.js'

function MovementModal({ open, onClose, products, initialProductId, initialType, onSaved }) {
  const [form, setForm] = useState({
    product_id: initialProductId ?? '',
    movement_type: initialType ?? 'IN',
    quantity: 1,
    note: '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    setForm({
      product_id: initialProductId ?? '',
      movement_type: initialType ?? 'IN',
      quantity: 1,
      note: '',
    })
    setError(null)
    setSaving(false)
  }, [open, initialProductId, initialType])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    const productIdValue = Number(form.product_id)
    const quantityValue = Number(form.quantity)
    if (!productIdValue || Number.isNaN(productIdValue)) {
      setError('Select a product.')
      return
    }
    if (Number.isNaN(quantityValue) || quantityValue <= 0) {
      setError('Quantity must be greater than 0.')
      return
    }

    setSaving(true)
    try {
      await createMovement({
        product_id: productIdValue,
        movement_type: form.movement_type,
        quantity: quantityValue,
        note: form.note.trim() || null,
      })
      if (onSaved) {
        onSaved()
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Unable to create movement.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h3>Create movement</h3>
            <p className="muted">Record stock moving in or out.</p>
          </div>
          <button type="button" className="ghost mini" onClick={onClose} disabled={saving}>
            Close
          </button>
        </div>
        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Product</span>
            <select
              value={form.product_id}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, product_id: event.target.value }))
              }
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Type</span>
            <select
              value={form.movement_type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, movement_type: event.target.value }))
              }
            >
              <option value="IN">IN (restock)</option>
              <option value="OUT">OUT (issue)</option>
            </select>
          </label>
          <label className="field">
            <span>Quantity</span>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Note</span>
            <input
              type="text"
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Optional context"
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovementModal
