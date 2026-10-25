export function Logo({ small = false }) {
  return (
    <span className={`tm-logo${small ? ' tm-logo--sm' : ''}`}>
      <span className="tm-logo__mark" aria-hidden="true">
        <i className="bi bi-clipboard-check" />
      </span>
      <span>TaskMate</span>
    </span>
  )
}

export default Logo
