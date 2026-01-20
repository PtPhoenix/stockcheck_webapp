import { useEffect, useState } from 'react'

import ThemeToggle from '../components/ThemeToggle.jsx'
import { getStockOverview } from '../lib/api.js'
import { useAuth } from '../state/auth.jsx'

function Inventory() {
  const { user, logout } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getStockOverview({
          search,
          lowStockOnly,
          sortBy,
          sortDir,
          skip: 0,
          limit: 50,
        })
        if (!active) {
          return
        }
        setItems(data.items ?? [])
        setTotal(data.total ?? 0)
      } catch (err) {
        if (!active) {
          return
        }
        setError(err.message || 'Failed to load inventory')
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
  }, [search, lowStockOnly, sortBy, sortDir])

  const onMovementAction = (type, item) => {
    setActionNotice({ type, name: item.name })
  }

  const itemLabel = total === 1 ? 'item' : 'items'

  return (
    <div className="page inventory-page">
      <header className="topbar">
        <div>
          <h1>Inventory</h1>
          <p className="muted">Welcome back{user?.email ? `, ${user.email}` : ''}.</p>
        </div>
        <div className="actions">
          <ThemeToggle />
          <button type="button" className="ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <section className="panel inventory-panel">
        <div className="inventory-head">
          <div>
            <h2>Stock overview</h2>
            <p className="muted">
              {loading ? 'Loading inventory…' : `${total} ${itemLabel} listed`}
            </p>
          </div>
          <div className="inventory-controls">
            <label className="field compact">
              <span>Search</span>
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Find a product"
              />
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(event) => setLowStockOnly(event.target.checked)}
              />
              <span>Low stock only</span>
            </label>
            <label className="field compact">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="name">Name</option>
                <option value="balance">Balance</option>
              </select>
            </label>
            <label className="field compact">
              <span>Direction</span>
              <select value={sortDir} onChange={(event) => setSortDir(event.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
          </div>
        </div>

        {actionNotice ? (
          <div className="notice">
            <div>
              <strong>{actionNotice.type}</strong> ready for {actionNotice.name}. Movement
              form will appear here soon.
            </div>
            <button type="button" className="ghost mini" onClick={() => setActionNotice(null)}>
              Dismiss
            </button>
          </div>
        ) : null}

        {error ? <div className="error">{error}</div> : null}

        <div className="table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit</th>
                <th>Balance</th>
                <th>Min stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="empty">
                    No products match the current filters.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className={item.low_stock ? 'low-stock' : ''}>
                    <td>
                      <div className="cell-title">
                        <span>{item.name}</span>
                        {item.low_stock ? <span className="tag danger">Low stock</span> : null}
                      </div>
                    </td>
                    <td>{item.unit}</td>
                    <td>{item.balance}</td>
                    <td>{item.min_stock}</td>
                    <td>
                      <div className="inventory-actions">
                        <button
                          type="button"
                          className="mini"
                          onClick={() => onMovementAction('IN', item)}
                        >
                          IN
                        </button>
                        <button
                          type="button"
                          className="mini danger"
                          onClick={() => onMovementAction('OUT', item)}
                        >
                          OUT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Inventory
