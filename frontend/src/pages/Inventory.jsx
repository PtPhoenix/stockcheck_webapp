import ThemeToggle from '../components/ThemeToggle.jsx'
import { useAuth } from '../state/auth.jsx'

function Inventory() {
  const { user, logout } = useAuth()

  return (
    <div className="page">
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
      <section className="panel">
        <h2>Coming soon</h2>
        <p className="muted">
          Stock overview, filters, and movements will appear here once the UI stages land.
        </p>
      </section>
    </div>
  )
}

export default Inventory
