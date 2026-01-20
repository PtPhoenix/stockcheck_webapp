import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import MovementModal from '../components/MovementModal.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import {
  createProduct,
  deactivateProduct,
  deleteProduct,
  getLowStockCount,
  getSettings,
  getStockOverview,
  listProducts,
  updateProduct,
} from '../lib/api.js'
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
  const [stockRefresh, setStockRefresh] = useState(0)
  const [productSearchInput, setProductSearchInput] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [productStatusFilter, setProductStatusFilter] = useState('all')
  const [productSortBy, setProductSortBy] = useState('created_at')
  const [productSortDir, setProductSortDir] = useState('desc')
  const [products, setProducts] = useState([])
  const [productsTotal, setProductsTotal] = useState(0)
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState(null)
  const [productsRefresh, setProductsRefresh] = useState(0)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    unit: 'pcs',
    min_stock: 0,
    initial_stock: 0,
    low_stock_enabled: true,
    is_active: true,
  })
  const [productFormError, setProductFormError] = useState(null)
  const [productFormSaving, setProductFormSaving] = useState(false)
  const [movementModalOpen, setMovementModalOpen] = useState(false)
  const [movementInitial, setMovementInitial] = useState({ productId: '', type: 'IN' })
  const [lowStockPopupOpen, setLowStockPopupOpen] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [lowStockSettings, setLowStockSettings] = useState({
    low_stock_popup_enabled: true,
    low_stock_pin_enabled: true,
    popup_cooldown_hours: 24,
  })
  const prevLowStockCountRef = useRef(0)

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
          lowStockFirst: lowStockSettings.low_stock_pin_enabled,
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
  }, [search, lowStockOnly, sortBy, sortDir, stockRefresh, lowStockSettings.low_stock_pin_enabled])

  useEffect(() => {
    const timer = setTimeout(() => {
      setProductSearch(productSearchInput.trim())
    }, 350)
    return () => clearTimeout(timer)
  }, [productSearchInput])

  useEffect(() => {
    let active = true

    const load = async () => {
      setProductsLoading(true)
      setProductsError(null)
      try {
        const data = await listProducts({
          search: productSearch,
          skip: 0,
          limit: 50,
        })
        if (!active) {
          return
        }
        setProducts(data.items ?? [])
        setProductsTotal(data.total ?? 0)
      } catch (err) {
        if (!active) {
          return
        }
        setProductsError(err.message || 'Failed to load products')
      } finally {
        if (active) {
          setProductsLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [productSearch, productsRefresh])

  useEffect(() => {
    if (!user?.email) {
      return
    }
    const storageUserKey = 'lowStockPopupUser'
    const storageKeyBase = `lowStockPopup:${user.email}`
    const previousUser = sessionStorage.getItem(storageUserKey)
    if (previousUser !== user.email) {
      sessionStorage.setItem(storageUserKey, user.email)
      sessionStorage.removeItem(`${storageKeyBase}:lastSeen`)
      sessionStorage.removeItem(`${storageKeyBase}:count`)
      prevLowStockCountRef.current = 0
      return
    }
    const storedCount = Number(sessionStorage.getItem(`${storageKeyBase}:count`) || 0)
    prevLowStockCountRef.current = Number.isNaN(storedCount) ? 0 : storedCount
  }, [user?.email])

  useEffect(() => {
    let active = true

    const loadPopup = async () => {
      try {
        const [settingsData, countData] = await Promise.all([getSettings(), getLowStockCount()])
        if (!active) {
          return
        }
        setLowStockSettings(settingsData)
        setLowStockCount(countData.count ?? 0)
      } catch (err) {
        if (!active) {
          return
        }
      }
    }

    loadPopup()

    return () => {
      active = false
    }
  }, [user?.email, stockRefresh, productsRefresh])

  useEffect(() => {
    if (!lowStockSettings.low_stock_popup_enabled) {
      return
    }
    if (!lowStockCount || lowStockCount <= 0) {
      return
    }
    const cooldownMs = (lowStockSettings.popup_cooldown_hours || 24) * 60 * 60 * 1000
    const storageKeyBase = `lowStockPopup:${user?.email || 'guest'}`
    const lastSeen = Number(sessionStorage.getItem(`${storageKeyBase}:lastSeen`) || 0)
    const now = Date.now()
    const previousCount = prevLowStockCountRef.current
    const countIncreased = lowStockCount > previousCount
    prevLowStockCountRef.current = lowStockCount
    sessionStorage.setItem(`${storageKeyBase}:count`, String(lowStockCount))
    if (countIncreased) {
      setLowStockPopupOpen(true)
      return
    }
    if (now - lastSeen < cooldownMs) {
      return
    }
    setLowStockPopupOpen(true)
  }, [lowStockCount, lowStockSettings, user?.email])

  const onMovementAction = (type, item) => {
    setMovementInitial({ productId: item.id, type })
    setMovementModalOpen(true)
  }

  const openMovementModal = () => {
    setMovementInitial({ productId: '', type: 'IN' })
    setMovementModalOpen(true)
  }

  const onPopupClose = () => {
    const storageKeyBase = `lowStockPopup:${user?.email || 'guest'}`
    sessionStorage.setItem(`${storageKeyBase}:lastSeen`, String(Date.now()))
    setLowStockPopupOpen(false)
  }

  const onPopupHide = () => {
    setLowStockPopupOpen(false)
  }

  const onPopupShowLowStock = () => {
    setLowStockOnly(true)
    onPopupClose()
  }

  const openCreateProduct = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      unit: 'pcs',
      min_stock: 0,
      initial_stock: 0,
      low_stock_enabled: true,
      is_active: true,
    })
    setProductFormError(null)
    setProductModalOpen(true)
  }

  const openEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name ?? '',
      unit: product.unit ?? '',
      min_stock: product.min_stock ?? 0,
      initial_stock: 0,
      low_stock_enabled: product.low_stock_enabled ?? true,
      is_active: product.is_active ?? true,
    })
    setProductFormError(null)
    setProductModalOpen(true)
  }

  const closeProductModal = () => {
    if (productFormSaving) {
      return
    }
    setProductModalOpen(false)
    setEditingProduct(null)
    setProductFormError(null)
  }

  const onProductSubmit = async (event) => {
    event.preventDefault()
    setProductFormError(null)

    const name = productForm.name.trim()
    const unit = productForm.unit.trim()
    const minStockValue = Number(productForm.min_stock)
    if (!name) {
      setProductFormError('Product name is required.')
      return
    }
    if (!unit) {
      setProductFormError('Unit is required.')
      return
    }
    if (Number.isNaN(minStockValue) || minStockValue < 0) {
      setProductFormError('Min stock must be 0 or higher.')
      return
    }
    if (!editingProduct) {
      const initialStockValue = Number(productForm.initial_stock)
      if (Number.isNaN(initialStockValue) || initialStockValue < 0) {
        setProductFormError('Initial stock must be 0 or higher.')
        return
      }
    }

    const payload = {
      name,
      unit,
      min_stock: minStockValue,
      low_stock_enabled: productForm.low_stock_enabled,
      is_active: productForm.is_active,
    }
    if (!editingProduct) {
      payload.initial_stock = Number(productForm.initial_stock)
    }

    setProductFormSaving(true)
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
      } else {
        await createProduct(payload)
      }
      setProductModalOpen(false)
      setEditingProduct(null)
      setProductsRefresh((value) => value + 1)
      setStockRefresh((value) => value + 1)
    } catch (err) {
      setProductFormError(err.message || 'Unable to save product.')
    } finally {
      setProductFormSaving(false)
    }
  }

  const onDeactivateProduct = async (product) => {
    const confirmed = window.confirm(`Deactivate "${product.name}"?`)
    if (!confirmed) {
      return
    }
    try {
      await deactivateProduct(product.id)
      setProductsRefresh((value) => value + 1)
      setStockRefresh((value) => value + 1)
    } catch (err) {
      setProductsError(err.message || 'Unable to deactivate product.')
    }
  }

  const onActivateProduct = async (product) => {
    try {
      await updateProduct(product.id, { is_active: true })
      setProductsRefresh((value) => value + 1)
      setStockRefresh((value) => value + 1)
    } catch (err) {
      setProductsError(err.message || 'Unable to activate product.')
    }
  }

  const onDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Permanently delete "${product.name}" and all movements? This cannot be undone.`
    )
    if (!confirmed) {
      return
    }
    try {
      await deleteProduct(product.id)
      setProductsRefresh((value) => value + 1)
      setStockRefresh((value) => value + 1)
    } catch (err) {
      setProductsError(err.message || 'Unable to delete product.')
    }
  }

  const itemLabel = total === 1 ? 'item' : 'items'
  const filteredProducts = [...products]
    .filter((product) => {
      if (productStatusFilter === 'active') {
        return product.is_active
      }
      if (productStatusFilter === 'inactive') {
        return !product.is_active
      }
      return true
    })
    .sort((a, b) => {
      let result = 0
      if (productSortBy === 'name') {
        result = a.name.localeCompare(b.name)
      } else if (productSortBy === 'min_stock') {
        result = (a.min_stock ?? 0) - (b.min_stock ?? 0)
      } else {
        result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return productSortDir === 'desc' ? -result : result
    })
  const productLabel = productsTotal === 1 ? 'product' : 'products'
  const filteredLabel = filteredProducts.length === 1 ? 'product' : 'products'

  return (
    <div className="page inventory-page">
      <header className="topbar">
        <div>
          <h1>Inventory</h1>
          <p className="muted">Welcome back{user?.email ? `, ${user.email}` : ''}.</p>
        </div>
        <div className="actions">
          <Link className="ghost link-button" to="/movements">
            Movements
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
            <h2>Stock overview</h2>
            <p className="muted">{loading ? 'Loading inventory...' : `${total} ${itemLabel} listed`}</p>
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
            <button type="button" onClick={openMovementModal}>
              New movement
            </button>
          </div>
        </div>

        {error ? <div className="error">{error}</div> : null}

        <div className="table-wrap">
          <table className="inventory-table">
            <colgroup>
              <col style={{ width: '36%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '24%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Product</th>
                <th>Balance</th>
                <th>Unit</th>
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
                    <td>{item.balance}</td>
                    <td>{item.unit}</td>
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

      <section className="panel products-panel">
        <div className="inventory-head">
          <div>
            <h2>Product management</h2>
            <p className="muted">
              {productsLoading
                ? 'Loading products...'
                : `${filteredProducts.length} ${filteredLabel} shown · ${productsTotal} ${productLabel} total`}
            </p>
          </div>
          <div className="inventory-controls">
            <label className="field compact">
              <span>Search products</span>
              <input
                type="search"
                value={productSearchInput}
                onChange={(event) => setProductSearchInput(event.target.value)}
                placeholder="Search by name"
              />
            </label>
            <label className="field compact">
              <span>Status</span>
              <select
                value={productStatusFilter}
                onChange={(event) => setProductStatusFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="field compact">
              <span>Sort by</span>
              <select value={productSortBy} onChange={(event) => setProductSortBy(event.target.value)}>
                <option value="created_at">Created</option>
                <option value="name">Name</option>
                <option value="min_stock">Min stock</option>
              </select>
            </label>
            <label className="field compact">
              <span>Direction</span>
              <select value={productSortDir} onChange={(event) => setProductSortDir(event.target.value)}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>
            <button type="button" onClick={openCreateProduct}>
              New product
            </button>
          </div>
        </div>

        {productsError ? <div className="error">{productsError}</div> : null}

        <div className="table-wrap">
          <table className="inventory-table">
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Product</th>
                <th>Min stock</th>
                <th>Unit</th>
                <th>Low-stock alert</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && !productsLoading ? (
                <tr>
                  <td colSpan={6} className="empty">
                    No products available yet.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className={!product.is_active ? 'inactive' : ''}>
                    <td>{product.name}</td>
                    <td>{product.min_stock}</td>
                    <td>{product.unit}</td>
                    <td>{product.low_stock_enabled ? 'Enabled' : 'Disabled'}</td>
                    <td>
                      {product.is_active ? (
                        <span className="tag">Active</span>
                      ) : (
                        <span className="tag danger">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="inventory-actions">
                        <button type="button" className="mini" onClick={() => openEditProduct(product)}>
                          Edit
                        </button>
                        {product.is_active ? (
                          <button
                            type="button"
                            className="mini ghost"
                            onClick={() => onDeactivateProduct(product)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="mini ghost"
                            onClick={() => onActivateProduct(product)}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          type="button"
                          className="mini danger"
                          onClick={() => onDeleteProduct(product)}
                        >
                          Delete
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

      {productModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>{editingProduct ? 'Edit product' : 'New product'}</h3>
                <p className="muted">
                  {editingProduct ? 'Update product details.' : 'Add a new item to inventory.'}
                </p>
              </div>
              <button type="button" className="ghost mini" onClick={closeProductModal}>
                Close
              </button>
            </div>
            <form className="stack" onSubmit={onProductSubmit}>
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Unit</span>
                <input
                  type="text"
                  value={productForm.unit}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, unit: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Min stock</span>
                <input
                  type="number"
                  min="0"
                  value={productForm.min_stock}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, min_stock: event.target.value }))
                  }
                  required
                />
              </label>
              {!editingProduct ? (
                <label className="field">
                  <span>Initial stock</span>
                  <input
                    type="number"
                    min="0"
                    value={productForm.initial_stock}
                    onChange={(event) =>
                      setProductForm((prev) => ({ ...prev, initial_stock: event.target.value }))
                    }
                  />
                </label>
              ) : null}
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={productForm.low_stock_enabled}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, low_stock_enabled: event.target.checked }))
                  }
                />
                <span>Enable low-stock alert</span>
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={productForm.is_active}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, is_active: event.target.checked }))
                  }
                />
                <span>Active product</span>
              </label>
              {productFormError ? <div className="error">{productFormError}</div> : null}
              <div className="modal-actions">
                <button type="button" className="ghost" onClick={closeProductModal}>
                  Cancel
                </button>
                <button type="submit" disabled={productFormSaving}>
                  {productFormSaving ? 'Saving...' : 'Save product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <MovementModal
        open={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        products={products}
        initialProductId={movementInitial.productId}
        initialType={movementInitial.type}
        onSaved={() => {
          setStockRefresh((value) => value + 1)
        }}
      />

      {lowStockPopupOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>Low stock detected</h3>
                <p className="muted">
                  {lowStockCount} {lowStockCount === 1 ? 'product' : 'products'} below minimum.
                </p>
              </div>
              <button type="button" className="ghost mini" onClick={onPopupHide}>
                Close
              </button>
            </div>
            <div className="modal-actions">
              <button type="button" className="ghost" onClick={onPopupClose}>
                Dismiss
              </button>
              <button type="button" onClick={onPopupShowLowStock}>
                Show low-stock
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Inventory
