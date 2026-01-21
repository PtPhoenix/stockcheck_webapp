import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ThemeToggle from '../components/ThemeToggle.jsx'
import { useAuth } from '../state/auth.jsx'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email: email.trim(), password })
      navigate('/inventory')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-actions">
        <ThemeToggle />
      </div>
      <div className="card">
        <h1>Sign in</h1>
        <p className="muted">Sign in with your administrator account.</p>
        <form onSubmit={onSubmit} className="stack">
          <label className="field">
            <span>Username</span>
            <input
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
