import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api, { extractErrors } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import Logo from '../../components/Logo'

export default function ResetPassword() {
  const { token } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    password: '',
    password_confirmation: '',
  })
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
      const { data } = await api.post('/auth/reset-password', {
        token,
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      })

      toast.success(data.message)
      navigate('/login', { replace: true })
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

        <h1 className="tm-auth-title">Reset your password</h1>
        <p className="tm-auth-subtitle">Choose a new password for your TaskMate account.</p>

        {errors.general && (
          <div className="tm-alert tm-alert--error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
            <span>{errors.general}</span>
          </div>
        )}

        {!token && (
          <div className="tm-alert tm-alert--error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
            <span>This reset link is invalid. Please request a new one.</span>
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
                New password<span className="tm-label__req">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`tm-input${errors.password ? ' has-error' : ''}`}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                autoComplete="new-password"
                required
              />
              {errors.password && (
                <span className="tm-error" role="alert">
                  <i className="bi bi-exclamation-circle" aria-hidden="true" />
                  {errors.password}
                </span>
              )}
            </div>

            <div className="tm-field">
              <label className="tm-label" htmlFor="password_confirmation">
                Confirm new password<span className="tm-label__req">*</span>
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                className={`tm-input${errors.password_confirmation ? ' has-error' : ''}`}
                placeholder="Repeat new password"
                value={form.password_confirmation}
                onChange={(event) => update('password_confirmation', event.target.value)}
                autoComplete="new-password"
                required
              />
              {errors.password_confirmation && (
                <span className="tm-error" role="alert">
                  <i className="bi bi-exclamation-circle" aria-hidden="true" />
                  {errors.password_confirmation}
                </span>
              )}
            </div>

            <button type="submit" className="tm-btn tm-btn--primary tm-btn--block" disabled={submitting || !token}>
              {submitting && <span className="tm-btn__spinner" aria-hidden="true" />}
              {submitting ? 'Updating...' : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="tm-auth-links">
          <Link to="/login">
            <i className="bi bi-arrow-left" aria-hidden="true" /> Back to Login
          </Link>
          <Link to="/forgot-password">Request a new link</Link>
        </div>
      </div>
    </div>
  )
}
