import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import Sidebar from './Sidebar'

/**
 * The authenticated application shell: sidebar + topbar + routed content.
 */
export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [counts, setCounts] = useState({})

  // Keep the sidebar counters in sync with the database.
  const loadCounts = async () => {
    try {
      const { data } = await api.get('/dashboard')
      setCounts(data.stats || {})
    } catch {
      // Counters are decorative — ignore transient failures.
    }
  }

  useEffect(() => {
    loadCounts()
  }, [location.pathname, location.search])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="tm-app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} counts={counts} />

      <div className="tm-main">
        <header className="tm-topbar">
          <button
            type="button"
            className="tm-icon-btn tm-mobile-only"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-controls="tm-sidebar"
            aria-expanded={sidebarOpen}
          >
            <i className="bi bi-list" aria-hidden="true" />
          </button>

          <form
            className="tm-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              const value = new FormData(event.currentTarget).get('globalSearch')?.trim()
              navigate(value ? `/tasks?search=${encodeURIComponent(value)}` : '/tasks')
            }}
          >
            <i className="bi bi-search tm-search__icon" aria-hidden="true" />
            <label className="tm-sr-only" htmlFor="globalSearch">
              Search tasks
            </label>
            <input
              id="globalSearch"
              name="globalSearch"
              type="search"
              className="tm-search__input"
              placeholder="Search tasks, notes or anything..."
              defaultValue={new URLSearchParams(location.search).get('search') || ''}
              key={location.pathname + location.search}
            />
          </form>

          <div style={{ flex: 1 }} />

          <button type="button" className="tm-btn tm-btn--primary" onClick={() => navigate('/tasks/new')}>
            <i className="bi bi-plus-lg" aria-hidden="true" />
            <span className="tm-hide-sm">Add New Task</span>
          </button>
        </header>

        <main className="tm-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
