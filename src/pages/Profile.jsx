import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractErrors } from '../lib/api'
import { initials } from '../lib/tasks'
import { TextInput } from '../components/FormFields'

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)

  function updateProfileField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }))
    setProfileErrors((current) => ({ ...current, [field]: undefined }))
  }

  function updatePasswordField(field, value) {
    setPasswords((current) => ({ ...current, [field]: value }))
    setPasswordErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileErrors({})

    try {
      const data = await updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
      })
      toast.success(data.message)
    } catch (error) {
      setProfileErrors(extractErrors(error))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setSavingPassword(true)
    setPasswordErrors({})

    try {
      const data = await changePassword({
        current_password: passwords.current_password,
        password: passwords.password,
        password_confirmation: passwords.password_confirmation,
      })
      toast.success(data.message)
      setPasswords({ current_password: '', password: '', password_confirmation: '' })
    } catch (error) {
      setPasswordErrors(extractErrors(error))
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div className="tm-page-head">
        <div>
          <h1 className="tm-page-title">Account settings</h1>
          <p className="tm-page-subtitle">Manage your profile details and password.</p>
        </div>
      </div>

      <div className="tm-two-col">
        <section className="tm-form-card">
          <div className="tm-form-card__head">
            <h2>Profile information</h2>
            <p>Update the name and email address on your account.</p>
          </div>

          <form onSubmit={handleProfileSubmit} noValidate>
            <div className="tm-form-card__body">
              {profileErrors.general && (
                <div className="tm-alert tm-alert--error" role="alert">
                  <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                  <span>{profileErrors.general}</span>
                </div>
              )}

              <div className="tm-form">
                <TextInput
                  label="Full name"
                  name="name"
                  required
                  value={profile.name}
                  onChange={(event) => updateProfileField('name', event.target.value)}
                  error={profileErrors.name}
                />

                <TextInput
                  label="Email address"
                  name="email"
                  type="email"
                  required
                  value={profile.email}
                  onChange={(event) => updateProfileField('email', event.target.value)}
                  error={profileErrors.email}
                />
              </div>
            </div>

            <div className="tm-form-card__foot">
              <button type="submit" className="tm-btn tm-btn--primary" disabled={savingProfile}>
                {savingProfile && <span className="tm-btn__spinner" aria-hidden="true" />}
                {savingProfile ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        <div className="tm-stack">
          <section className="tm-panel">
            <div className="tm-panel__head">
              <h2 className="tm-panel__title">Account</h2>
            </div>
            <div className="tm-panel__body">
              <div className="tm-row" style={{ gap: 12 }}>
                <span className="tm-avatar" aria-hidden="true">
                  {initials(user?.name)}
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--tm-navy)' }}>{user?.name}</div>
                  <div className="tm-hint">{user?.email}</div>
                </div>
              </div>

              <button
                type="button"
                className="tm-btn tm-btn--secondary tm-btn--block"
                style={{ marginTop: 16 }}
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true" /> Log out
              </button>
            </div>
          </section>

          <section className="tm-form-card">
            <div className="tm-form-card__head">
              <h2>Change password</h2>
              <p>Use at least 8 characters with letters and numbers.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} noValidate>
              <div className="tm-form-card__body">
                {passwordErrors.general && (
                  <div className="tm-alert tm-alert--error" role="alert">
                    <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                    <span>{passwordErrors.general}</span>
                  </div>
                )}

                <div className="tm-form">
                  <TextInput
                    label="Current password"
                    name="current_password"
                    type="password"
                    required
                    value={passwords.current_password}
                    onChange={(event) => updatePasswordField('current_password', event.target.value)}
                    error={passwordErrors.current_password}
                    autoComplete="current-password"
                  />

                  <TextInput
                    label="New password"
                    name="password"
                    type="password"
                    required
                    value={passwords.password}
                    onChange={(event) => updatePasswordField('password', event.target.value)}
                    error={passwordErrors.password}
                    autoComplete="new-password"
                  />

                  <TextInput
                    label="Confirm new password"
                    name="password_confirmation"
                    type="password"
                    required
                    value={passwords.password_confirmation}
                    onChange={(event) => updatePasswordField('password_confirmation', event.target.value)}
                    error={passwordErrors.password_confirmation}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="tm-form-card__foot">
                <button type="submit" className="tm-btn tm-btn--primary" disabled={savingPassword}>
                  {savingPassword && <span className="tm-btn__spinner" aria-hidden="true" />}
                  {savingPassword ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  )
}
