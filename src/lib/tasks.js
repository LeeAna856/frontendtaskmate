export const PRIORITIES = ['Low', 'Medium', 'High']
export const STATUSES = ['Not Started', 'In Progress', 'Completed']

/** Maps a priority to its badge class name. */
export function priorityClass(priority) {
  switch (priority) {
    case 'High':
      return 'tm-badge tm-badge-high'
    case 'Medium':
      return 'tm-badge tm-badge-medium'
    case 'Low':
      return 'tm-badge tm-badge-low'
    default:
      return 'tm-badge'
  }
}

/** Maps a status to its badge class name. */
export function statusClass(status) {
  switch (status) {
    case 'Completed':
      return 'tm-badge tm-badge-completed'
    case 'In Progress':
      return 'tm-badge tm-badge-progress'
    case 'Not Started':
      return 'tm-badge tm-badge-notstarted'
    default:
      return 'tm-badge'
  }
}

/** True when a task is past its due date and not yet completed. */
export function isOverdue(task) {
  if (!task?.due_date || task.status === 'Completed') {
    return false
  }

  return new Date(task.due_date) < new Date(new Date().toDateString())
}

/** Formats a Y-m-d date string for display. */
export function formatDate(date) {
  if (!date) {
    return '—'
  }

  const parsed = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Human readable "due in X days" / "overdue" text. */
export function dueLabel(task) {
  if (!task?.due_date) {
    return { text: 'No due date', tone: 'muted' }
  }

  const due = new Date(`${task.due_date}T00:00:00`)
  const today = new Date(new Date().toDateString())
  const diffDays = Math.round((due - today) / 86400000)

  if (task.status === 'Completed') {
    return { text: formatDate(task.due_date), tone: 'muted' }
  }

  if (diffDays < 0) {
    const late = Math.abs(diffDays)
    return { text: `${late} day${late === 1 ? '' : 's'} overdue`, tone: 'danger' }
  }

  if (diffDays === 0) {
    return { text: 'Due today', tone: 'warning' }
  }

  if (diffDays === 1) {
    return { text: 'Due tomorrow', tone: 'muted' }
  }

  return { text: formatDate(task.due_date), tone: 'muted' }
}

/** Extracts the initials shown in the avatar circle. */
export function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'TM'
  )
}
