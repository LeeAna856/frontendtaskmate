import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { initials } from '../../lib/tasks'
import Logo from '../Logo'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
  { to: '/tasks', label: 'All Tasks', icon: 'bi-list-check' },
  { to: '/tasks/in-progress', label: 'In Progress', icon: 'bi-hourglass-split' },
  { to: '/tasks/completed', label: 'Completed', icon: 'bi-check2-circle' },
  { to: '/trash', label: 'Trash', icon: 'bi-trash3' },
]

export default function Sidebar({ open, onClose, counts = {} }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function onDocumentClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const countFor = (to) => {
    if (to === '/dashboard' || to === '/tasks') return counts.all
    if (to === '/tasks/in-progress') return counts.in_progress
    if (to === '/tasks/completed') return counts.completed
    if (to === '/trash') return counts.trashed
    return null
  }

  return (
    <>
      {open && <div className="tm-sidebar-overlay" onClick={onClose} aria-hidden="true" />}

      <aside className={`tm-sidebar${open ? ' is-open' : ''}`} id="tm-sidebar" aria-label="Main navigation">
        <div className="tm-sidebar__brand">
          <Logo />
        </div>

        <nav className="tm-sidebar__nav">
          <p className="tm-nav-label">Menu</p>

          {NAV_ITEMS.map((item) => {
            const count = countFor(item.to)

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/tasks'}
                className={({ isActive }) => `tm-nav-item${isActive ? ' is-active' : ''}`}
                onClick={onClose}
              >
                <i className={`bi ${item.icon} tm-nav-item__icon`} aria-hidden="true" />
                <span>{item.label}</span>
                {count !== null && count !== undefined && <span className="tm-nav-item__count">{count}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="tm-sidebar__footer" ref={menuRef}>
          {menuOpen && (
            <div className="tm-dropdown" role="menu">
              <button type="button" className="tm-dropdown__item" role="menuitem" onClick={() => { setMenuOpen(false); navigate('/profile') }}>
                <i className="bi bi-person-gear" aria-hidden="true" />
                Account settings
              </button>
              <button type="button" className="tm-dropdown__item" role="menuitem" onClick={() => { setMenuOpen(false); navigate('/tasks') }}>
                <i className="bi bi-list-check" aria-hidden="true" />
                My tasks
              </button>
              <div className="tm-dropdown__divider" />
              <button type="button" className="tm-dropdown__item tm-dropdown__item--danger" role="menuitem" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                Log out
              </button>
            </div>
          )}

          <button
            type="button"
            className="tm-user-chip"
            onClick={() => setMenuOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="tm-avatar" aria-hidden="true">
              {initials(user?.name)}
            </span>
            <span className="tm-user-chip__meta">
              <span className="tm-user-chip__name">{user?.name}</span>
              <span className="tm-user-chip__email">{user?.email}</span>
            </span>
            <i className={`bi ${menuOpen ? 'bi-chevron-down' : 'bi-chevron-up'}`} aria-hidden="true" style={{ color: 'var(--tm-muted-light)' }} />
          </button>
        </div>
      </aside>
    </>
  )
}
