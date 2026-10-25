import { dueLabel, formatDate, isOverdue, priorityClass, statusClass } from '../lib/tasks'

/**
 * The task table shared by the dashboard and the task list pages.
 */
export default function TaskTable({
  tasks = [],
  loading = false,
  onToggle,
  onEdit,
  onDelete,
  onRestore,
  onForceDelete,
  emptyState,
  showCheckbox = true,
  mode = 'active',
  busyId = null,
}) {
  if (loading) {
    return (
      <div className="tm-loading">
        <span className="tm-spinner" aria-hidden="true" />
        <span>Loading tasks...</span>
      </div>
    )
  }

  if (!tasks.length) {
    return emptyState || (
      <div className="tm-empty">
        <span className="tm-empty__icon" aria-hidden="true">
          <i className="bi bi-clipboard2" />
        </span>
        <h3 className="tm-empty__title">No tasks yet</h3>
        <p className="tm-empty__text">Create your first task to start organising your work.</p>
      </div>
    )
  }

  return (
    <div className="tm-table-wrap">
      <table className="tm-table">
        <thead>
          <tr>
            {showCheckbox && <th scope="col" className="tm-cell-check" />}
            <th scope="col">Task Title</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Due Date</th>
            <th scope="col" style={{ textAlign: 'right' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const due = dueLabel(task)
            const overdue = isOverdue(task)
            const busy = busyId === task.id

            return (
              <tr key={task.id} className={task.status === 'Completed' ? 'is-completed' : undefined}>
                {showCheckbox && (
                  <td className="tm-cell-check">
                    <input
                      type="checkbox"
                      className="tm-check"
                      checked={task.status === 'Completed'}
                      disabled={busy || mode !== 'active'}
                      onChange={() => onToggle?.(task)}
                      aria-label={task.status === 'Completed' ? `Reopen ${task.title}` : `Mark ${task.title} as completed`}
                    />
                  </td>
                )}

                <td>
                  <span className="tm-task-title">{task.title}</span>
                  {task.description && <span className="tm-task-desc">{task.description}</span>}
                </td>

                <td>
                  <span className={priorityClass(task.priority)}>{task.priority}</span>
                </td>

                <td>
                  <span className={statusClass(task.status)}>{task.status}</span>
                </td>

                <td>
                  <span className={`tm-due tm-due--${overdue ? 'danger' : due.tone}`}>
                    {overdue ? <i className="bi bi-exclamation-circle" aria-hidden="true" /> : null}{' '}
                    {task.due_date ? formatDate(task.due_date) : '—'}
                  </span>
                  {overdue && (
                    <div className="tm-due tm-due--danger" style={{ fontSize: '11.5px' }}>
                      {due.text}
                    </div>
                  )}
                </td>

                <td>
                  <div className="tm-actions">
                    {mode === 'active' && (
                      <>
                        <button
                          type="button"
                          className="tm-icon-btn"
                          onClick={() => onEdit?.(task)}
                          disabled={busy}
                          title="Edit task"
                          aria-label={`Edit ${task.title}`}
                        >
                          <i className="bi bi-pencil-square" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="tm-icon-btn tm-icon-btn--danger"
                          onClick={() => onDelete?.(task)}
                          disabled={busy}
                          title="Move to trash"
                          aria-label={`Move ${task.title} to trash`}
                        >
                          <i className="bi bi-trash3" aria-hidden="true" />
                        </button>
                      </>
                    )}

                    {mode === 'trash' && (
                      <>
                        <button
                          type="button"
                          className="tm-icon-btn"
                          onClick={() => onRestore?.(task)}
                          disabled={busy}
                          title="Restore task"
                          aria-label={`Restore ${task.title}`}
                        >
                          <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="tm-icon-btn tm-icon-btn--danger"
                          onClick={() => onForceDelete?.(task)}
                          disabled={busy}
                          title="Delete permanently"
                          aria-label={`Permanently delete ${task.title}`}
                        >
                          <i className="bi bi-x-octagon" aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
