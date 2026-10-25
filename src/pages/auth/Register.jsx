import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { extractErrors } from '../../lib/api'
import Logo from '../../components/Logo'

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
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
      const data = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      })

      toast.success(data.message || 'Your account has been created.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrors(extractErrors(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="tm-auth-page">
      <div className="tm-auth-card tm-auth-card--wide">
        <div className="tm-auth-brand">
          <Logo />
        </div>

        <h1 className="tm-auth-title">Create your account</h1>
        <p className="tm-auth-subtitle">Start organising your tasks with TaskMate.</p>

        {errors.general && (
          <div className="tm-alert tm-alert--error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="tm-stack">
            <div className="tm-field">
              <label className="tm-label" htmlFor="name">
                Full name<span className="tm-label__req">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`tm-input${errors.name ? ' has-error' : ''}`}
                placeholder="Jane Cooper"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                autoComplete="name"
                required
                autoFocus
              />
              {errors.name && (
                <span className="tm-error" role="alert">
                  <i className="bi bi-exclamation-circle" aria-hidden="true" />
                  {errors.name}
                </span>
              )}
            </div>

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
              />
              {errors.email && (
                <span className="tm-error" role="alert">
                  <i className="bi bi-exclamation-circle" aria-hidden="true" />
                  {errors.email}
                </span>
              )}
            </div>

            <div className="tm-field-row">
              <div className="tm-field">
                <label className="tm-label" htmlFor="password">
                  Password<span className="tm-label__req">*</span>
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
                  Confirm password<span className="tm-label__req">*</span>
                </label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  className={`tm-input${errors.password_confirmation ? ' has-error' : ''}`}
                  placeholder="Repeat password"
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
            </div>

            <p className="tm-hint">
              Use at least 8 characters and include both letters and numbers.
            </p>

            <button type="submit" className="tm-btn tm-btn--primary tm-btn--block" disabled={submitting}>
              {submitting && <span className="tm-btn__spinner" aria-hidden="true" />}
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="tm-auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  )
}
