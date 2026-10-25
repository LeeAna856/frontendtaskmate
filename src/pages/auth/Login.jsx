import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { extractErrors } from '../../lib/api'
import Logo from '../../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, general: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const data = await login({
        email: form.email.trim(),
        password: form.password,
        remember: form.remember,
      })

      toast.success(data.message || 'Welcome back!')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrors(extractErrors(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="tm-auth-page">
      <div className="tm-auth-card">
        <div className="tm-auth-brand">
          <Logo />
        </div>

        <h1 className="tm-auth-title">Welcome back</h1>
        <p className="tm-auth-subtitle">Log in to continue to your TaskMate dashboard.</p>

        {errors.general && (
          <div className="tm-alert tm-alert--error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="tm-stack">
            <div className="tm-field">
              <label className="tm-label" htmlFor="email">
                Email address<span className="tm-label__req">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`tm-input${errors.email ? ' has-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                autoComplete="email"
                required
                autoFocus
              />
              {errors.email && (
                <span className="tm-error" role="alert">
                  <i className="bi bi-exclamation-circle" aria-hidden="true" />
                  {errors.email}
                </span>
              )}
            </div>

            <div className="tm-field">
              <label className="tm-label" htmlFor="password">
                Password<span className="tm-label__req">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`tm-input${errors.password ? ' has-error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                autoComplete="current-password"
                required
              />
              {errors.password && (
                <span className="tm-error" role="alert">
                  <i className="bi bi-exclamation-circle" aria-hidden="true" />
                  {errors.password}
                </span>
              )}
            </div>

            <div className="tm-auth-row">
              <label className="tm-checkbox-row" htmlFor="remember">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={(event) => update('remember', event.target.checked)}
                />
                Remember me
              </label>

              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="tm-btn tm-btn--primary tm-btn--block" disabled={submitting}>
              {submitting && <span className="tm-btn__spinner" aria-hidden="true" />}
              {submitting ? 'Signing in...' : 'Log In'}
            </button>
          </div>
        </form>

        <div className="tm-auth-footer">
          Don&apos;t have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  )
}
