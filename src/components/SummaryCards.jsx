/**
 * The four live summary cards shown on the dashboard.
 */
export default function SummaryCards({ stats = {} }) {
  const cards = [
    { key: 'all', label: 'All Tasks', value: stats.all ?? 0, icon: 'bi-list-check', tone: 'blue' },
    { key: 'in_progress', label: 'In Progress', value: stats.in_progress ?? 0, icon: 'bi-hourglass-split', tone: 'amber' },
    { key: 'completed', label: 'Completed', value: stats.completed ?? 0, icon: 'bi-check2-circle', tone: 'green' },
    { key: 'overdue', label: 'Overdue', value: stats.overdue ?? 0, icon: 'bi-exclamation-triangle', tone: 'red' },
  ]

  return (
    <div className="tm-stats">
      {cards.map((card) => (
        <div className="tm-stat" key={card.key}>
          <span className={`tm-stat__icon tm-stat__icon--${card.tone}`} aria-hidden="true">
            <i className={`bi ${card.icon}`} />
          </span>
          <div>
            <div className="tm-stat__value">{card.value}</div>
            <div className="tm-stat__label">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
