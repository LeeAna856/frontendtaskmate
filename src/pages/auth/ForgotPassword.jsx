import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { extractErrors } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import Logo from '../../components/Logo'

export default function ForgotPassword() {
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() })
      setSent(true)
      toast.success(data.message)
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

        <h1 className="tm-auth-title">Forgot your password?</h1>
        <p className="tm-auth-subtitle">
          Enter the email address linked to your account and we&apos;ll send you a reset link.
        </p>

        {errors.general && (
          <div className="tm-alert tm-alert--error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
            <span>{errors.general}</span>
          </div>
        )}

        {sent ? (
          <div className="tm-alert tm-alert--success" role="status">
            <i className="bi bi-envelope-check-fill" aria-hidden="true" />
            <span>
              If an account exists for <strong>{email}</strong>, a password reset link is on its way. Check your
              inbox (or the Laravel log when using the <code>log</code> mail driver).
            </span>
          </div>
        ) : (
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
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setErrors((current) => ({ ...current, email: undefined }))
                  }}
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

              <button type="submit" className="tm-btn tm-btn--primary tm-btn--block" disabled={submitting}>
                {submitting && <span className="tm-btn__spinner" aria-hidden="true" />}
                {submitting ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}

        <div className="tm-auth-links">
          <Link to="/login">
            <i className="bi bi-arrow-left" aria-hidden="true" /> Back to Login
          </Link>
          <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  )
}
