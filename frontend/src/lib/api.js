const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
  params.set('sort_by', sortBy)
  params.set('sort_dir', sortDir)
  params.set('skip', String(skip))
  params.set('limit', String(limit))
  const query = params.toString()
  return request(`/stock/overview?${query}`, { method: 'GET' })
}
