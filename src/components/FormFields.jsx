/**
 * Reusable form field wrappers: text input, textarea, select.
 */
export function Field({ label, required, error, hint, htmlFor, children }) {
  return (
    <div className="tm-field">
      {label && (
        <label className="tm-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="tm-label__req">*</span>}
        </label>
      )}
      {children}
      {error && (
        <span className="tm-error" role="alert">
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
          {error}
        </span>
      )}
      {!error && hint && <span className="tm-hint">{hint}</span>}
    </div>
  )
}

export function TextInput({ label, error, hint, required, id, ...props }) {
  const fieldId = id || props.name

  return (
    <Field label={label} required={required} error={error} hint={hint} htmlFor={fieldId}>
      <input id={fieldId} className={`tm-input${error ? ' has-error' : ''}`} aria-invalid={error ? 'true' : undefined} {...props} />
    </Field>
  )
}

export function TextArea({ label, error, hint, required, id, ...props }) {
  const fieldId = id || props.name

  return (
    <Field label={label} required={required} error={error} hint={hint} htmlFor={fieldId}>
      <textarea
        id={fieldId}
        className={`tm-textarea${error ? ' has-error' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    </Field>
  )
}

export function Select({ label, error, hint, required, id, options = [], placeholder, ...props }) {
  const fieldId = id || props.name

  return (
    <Field label={label} required={required} error={error} hint={hint} htmlFor={fieldId}>
      <select
        id={fieldId}
        className={`tm-select--field${error ? ' has-error' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </Field>
  )
}

export default Field
