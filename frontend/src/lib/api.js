const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_PREFIX = '/api'

function buildApiUrl(path) {
  return `${API_BASE_URL}${API_PREFIX}${path}`
}

async function request(path, options = {}) {
  const response = await fetch(buildApiUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let payload = null
    try {
      payload = await response.json()
    } catch (error) {
      payload = null
    }
    const message = payload?.detail || `Request failed with status ${response.status}`
    const err = new Error(message)
    err.status = response.status
    throw err
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export async function getCurrentUser() {
  return request('/auth/me', { method: 'GET' })
}

export async function login(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function logout() {
  return request('/auth/logout', { method: 'POST' })
}

export async function getStockOverview({
  search,
  lowStockOnly = false,
  sortBy = 'name',
  sortDir = 'asc',
  lowStockFirst = false,
  skip = 0,
  limit = 50,
} = {}) {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  if (lowStockOnly) {
    params.set('low_stock_only', 'true')
  }
  if (lowStockFirst) {
    params.set('low_stock_first', 'true')
  }
  params.set('sort_by', sortBy)
  params.set('sort_dir', sortDir)
  params.set('skip', String(skip))
  params.set('limit', String(limit))
  const query = params.toString()
  return request(`/stock/overview?${query}`, { method: 'GET' })
}

export async function listProducts({ search, skip = 0, limit = 50 } = {}) {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  params.set('skip', String(skip))
  params.set('limit', String(limit))
  const query = params.toString()
  return request(`/products?${query}`, { method: 'GET' })
}

export async function createProduct(payload) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateProduct(productId, payload) {
  return request(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deactivateProduct(productId) {
  return request(`/products/${productId}`, { method: 'DELETE' })
}

export async function deleteProduct(productId) {
  return request(`/products/${productId}/hard`, { method: 'DELETE' })
}

export async function listMovements({
  productId,
  movementType,
  skip = 0,
  limit = 50,
} = {}) {
  const params = new URLSearchParams()
  if (productId) {
    params.set('product_id', String(productId))
  }
  if (movementType) {
    params.set('movement_type', movementType)
  }
  params.set('skip', String(skip))
  params.set('limit', String(limit))
  const query = params.toString()
  return request(`/movements?${query}`, { method: 'GET' })
}

export async function createMovement(payload) {
  return request('/movements', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getSettings() {
  return request('/settings', { method: 'GET' })
}

export async function updateSettings(payload) {
  return request('/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function getLowStockCount() {
  return request('/stock/low/count', { method: 'GET' })
}

async function downloadCsv(path, fallbackFilename) {
  const response = await fetch(buildApiUrl(path), {
    credentials: 'include',
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const payload = await response.json()
      message = payload?.detail || message
    } catch (error) {
      message = message
    }
    const err = new Error(message)
    err.status = response.status
    throw err
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match ? match[1] : fallbackFilename
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function exportProductsCsv() {
  return downloadCsv('/export/products.csv', 'products.csv')
}

export async function exportMovementsCsv({ startAt, endAt } = {}) {
  const params = new URLSearchParams()
  if (startAt) {
    params.set('start_at', startAt)
  }
  if (endAt) {
    params.set('end_at', endAt)
  }
  const query = params.toString()
  const path = query ? `/export/movements.csv?${query}` : '/export/movements.csv'
  return downloadCsv(path, 'movements.csv')
}

export async function exportStockOverviewCsv({
  search,
  lowStockOnly = false,
  sortBy = 'name',
  sortDir = 'asc',
  lowStockFirst = false,
  activeOnly = true,
} = {}) {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  if (lowStockOnly) {
    params.set('low_stock_only', 'true')
  }
  if (!activeOnly) {
    params.set('active_only', 'false')
  }
  if (lowStockFirst) {
    params.set('low_stock_first', 'true')
  }
  params.set('sort_by', sortBy)
  params.set('sort_dir', sortDir)
  const query = params.toString()
  return downloadCsv(`/export/stock_overview.csv?${query}`, 'stock_overview.csv')
}
