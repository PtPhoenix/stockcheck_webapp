import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import ThemeToggle from '../components/ThemeToggle.jsx'
import { getSettings, updateSettings } from '../lib/api.js'
import { useAuth } from '../state/auth.jsx'

function Settings() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({
    low_stock_popup_enabled: true,
    low_stock_pin_enabled: true,
    popup_cooldown_hours: 24,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getSettings()
        if (!active) {
          return
        }
        setForm({
          low_stock_popup_enabled: data.low_stock_popup_enabled,
          low_stock_pin_enabled: data.low_stock_pin_enabled,
          popup_cooldown_hours: data.popup_cooldown_hours,
        })
      } catch (err) {
        if (!active) {
          return
        }
        setError(err.message || 'Failed to load settings.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setNotice(null)

    const cooldownValue = Number(form.popup_cooldown_hours)
    if (Number.isNaN(cooldownValue) || cooldownValue < 1) {
      setError('Cooldown must be at least 1 hour.')
      return
    }

    setSaving(true)
    try {
      const data = await updateSettings({
        low_stock_popup_enabled: form.low_stock_popup_enabled,
        low_stock_pin_enabled: form.low_stock_pin_enabled,
        popup_cooldown_hours: cooldownValue,
      })
      setForm({
        low_stock_popup_enabled: data.low_stock_popup_enabled,
        low_stock_pin_enabled: data.low_stock_pin_enabled,
        popup_cooldown_hours: data.popup_cooldown_hours,
      })
      setNotice('Settings saved.')
    } catch (err) {
      setError(err.message || 'Unable to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page inventory-page">
      <header className="topbar">
        <div>
          <h1>Settings</h1>
          <p className="muted">Hi{user?.email ? `, ${user.email}` : ''}. Configure low-stock behavior.</p>
        </div>
        <div className="actions">
          <Link className="ghost link-button" to="/inventory">
            Inventory
          </Link>
          <Link className="ghost link-button" to="/movements">
            Movements
          </Link>
          <ThemeToggle />
          <button type="button" className="ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="panel">
        <h2>Low stock alerts</h2>
        <p className="muted">Control popup notifications and sorting behavior.</p>
        {loading ? <p className="muted">Loading settings...</p> : null}
        {error ? <div className="error">{error}</div> : null}
        {notice ? <div className="notice">{notice}</div> : null}
        <form className="stack" onSubmit={handleSubmit}>
          <label className="toggle">
            <input
              type="checkbox"
              checked={form.low_stock_popup_enabled}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, low_stock_popup_enabled: event.target.checked }))
              }
            />
            <span>Enable low-stock popup</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={form.low_stock_pin_enabled}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, low_stock_pin_enabled: event.target.checked }))
              }
            />
            <span>Pin low-stock items to top</span>
          </label>
          <label className="field">
            <span>Popup cooldown (hours)</span>
            <input
              type="number"
              min="1"
              value={form.popup_cooldown_hours}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, popup_cooldown_hours: event.target.value }))
              }
            />
          </label>
          <div className="modal-actions">
            <button type="submit" disabled={saving || loading}>
              {saving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Settings
