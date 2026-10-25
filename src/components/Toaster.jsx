import { useToast } from '../context/ToastContext'

/**
 * Renders the stack of transient notification toasts.
 */
export default function Toaster() {
  const { toasts, dismiss } = useToast()

  if (!toasts.length) return null

  const icons = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    info: 'bi-info-circle-fill',
  }

  return (
    <div className="tm-toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`tm-toast tm-toast--${toast.type}`}>
          <i className={`bi ${icons[toast.type] || icons.info} tm-toast__icon`} aria-hidden="true" />
          <span>{toast.message}</span>
          <button type="button" className="tm-toast__close" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
