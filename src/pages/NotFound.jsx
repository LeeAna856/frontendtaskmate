import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function NotFound() {
  return (
    <div className="tm-auth-page">
      <div className="tm-auth-card">
        <div className="tm-auth-brand">
          <Logo />
        </div>

        <h1 className="tm-auth-title">Page not found</h1>
        <p className="tm-auth-subtitle">The page you were looking for does not exist or has moved.</p>

        <Link to="/dashboard" className="tm-btn tm-btn--primary tm-btn--block">
          <i className="bi bi-arrow-left" aria-hidden="true" /> Back to dashboard
        </Link>
      </div>
    </div>
  )
}
