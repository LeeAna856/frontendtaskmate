import { useEffect } from 'react'

/**
 * Accessible confirmation dialog used for every destructive action.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape' && !busy) {
        onCancel?.()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, busy, onCancel])

  if (!open) return null

  return (
    <div
      className="tm-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel?.()
      }}
    >
      <div className="tm-modal" role="alertdialog" aria-modal="true" aria-labelledby="tm-confirm-title">
        <span className={`tm-modal__icon tm-modal__icon--${tone}`} aria-hidden="true">
          <i className={`bi ${tone === 'danger' ? 'bi-exclamation-triangle' : 'bi-question-lg'}`} />
        </span>
        <h3 className="tm-modal__title" id="tm-confirm-title">
          {title}
        </h3>
        <p className="tm-modal__text">{message}</p>
        <div className="tm-modal__actions">
          <button type="button" className="tm-btn tm-btn--secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`tm-btn ${tone === 'danger' ? 'tm-btn--danger' : 'tm-btn--primary'}`}
            onClick={onConfirm}
            disabled={busy}
            autoFocus
          >
            {busy && <span className="tm-btn__spinner" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
