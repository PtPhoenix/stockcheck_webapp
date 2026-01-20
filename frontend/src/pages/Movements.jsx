import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import MovementModal from '../components/MovementModal.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { listMovements, listProducts } from '../lib/api.js'
import { useAuth } from '../state/auth.jsx'

function Movements() {
  const { user, logout } = useAuth()
  const [products, setProducts] = useState([])
  const [productsError, setProductsError] = useState(null)
  const [movementType, setMovementType] = useState('')
  const [productId, setProductId] = useState('')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [movementModalOpen, setMovementModalOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let active = true

    const loadProducts = async () => {
      setProductsError(null)
      try {
        const data = await listProducts({ skip: 0, limit: 200 })
        if (!active) {
          return
        }
        setProducts(data.items ?? [])
      } catch (err) {
        if (!active) {
          return
        }
        setProductsError(err.message || 'Failed to load products')
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadMovements = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listMovements({
          productId: productId ? Number(productId) : undefined,
          movementType: movementType || undefined,
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
        setError(err.message || 'Failed to load movements')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadMovements()

    return () => {
      active = false
    }
  }, [movementType, productId, refresh])

  const productLookup = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product
      return acc
    }, {})
  }, [products])

  const itemLabel = total === 1 ? 'movement' : 'movements'

  return (
    <div className="page inventory-page">
      <header className="topbar">
        <div>
          <h1>Movements</h1>
          <p className="muted">Hello{user?.email ? `, ${user.email}` : ''}. Track stock flow.</p>
        </div>
        <div className="actions">
          <Link className="ghost link-button" to="/inventory">
            Inventory
          </Link>
          <Link className="ghost link-button" to="/settings">
            Settings
          </Link>
          <ThemeToggle />
          <button type="button" className="ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="panel inventory-panel">
        <div className="inventory-head">
          <div>
            <h2>Movement history</h2>
            <p className="muted">{loading ? 'Loading movements...' : `${total} ${itemLabel}`}</p>
          </div>
          <div className="inventory-controls">
            <label className="field compact">
              <span>Product</span>
              <select value={productId} onChange={(event) => setProductId(event.target.value)}>
                <option value="">All products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field compact">
              <span>Type</span>
              <select value={movementType} onChange={(event) => setMovementType(event.target.value)}>
                <option value="">All types</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
            </label>
            <button type="button" onClick={() => setMovementModalOpen(true)}>
              New movement
            </button>
          </div>
        </div>

        {productsError ? <div className="error">{productsError}</div> : null}
        {error ? <div className="error">{error}</div> : null}

        <div className="table-wrap">
          <table className="inventory-table">
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '26%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Unit</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="empty">
                    No movements found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                    <td>{productLookup[item.product_id]?.name || `#${item.product_id}`}</td>
                    <td>{productLookup[item.product_id]?.unit || '-'}</td>
                    <td>
                      <span className={`tag ${item.movement_type === 'OUT' ? 'danger' : ''}`}>
                        {item.movement_type}
                      </span>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.note || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <MovementModal
        open={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        products={products}
        initialProductId=""
        initialType="IN"
        onSaved={() => setRefresh((value) => value + 1)}
      />
    </div>
  )
}

export default Movements
