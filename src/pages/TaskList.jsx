import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api, { extractErrors } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { PRIORITIES, STATUSES } from '../lib/tasks'
import TaskTable from '../components/TaskTable'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'

const SORT_OPTIONS = [
  { value: 'created_at|desc', label: 'Newest first' },
  { value: 'created_at|asc', label: 'Oldest first' },
  { value: 'due_date|asc', label: 'Due date (earliest)' },
  { value: 'due_date|desc', label: 'Due date (latest)' },
  { value: 'title|asc', label: 'Title (A-Z)' },
  { value: 'title|desc', label: 'Title (Z-A)' },
  { value: 'priority|desc', label: 'Priority (High first)' },
  { value: 'priority|asc', label: 'Priority (Low first)' },
]

const DUE_OPTIONS = [
  { value: 'all', label: 'Any due date' },
  { value: 'today', label: 'Due today' },
  { value: 'week', label: 'Due this week' },
  { value: 'overdue', label: 'Overdue only' },
  { value: 'no_due_date', label: 'No due date' },
]

/**
 * Shared list screen used by All Tasks, In Progress and Completed.
 * The `lockedStatus` prop forces a status filter server-side.
 */
export default function TaskList({
  lockedStatus = null,
  title = 'All Tasks',
  subtitle = 'Every active task in your account.',
  emptyTitle = 'No tasks found',
  emptyText = 'Try adjusting your filters, or create a new task.',
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [tasks, setTasks] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const search = searchParams.get('search') || ''
  const status = lockedStatus || searchParams.get('status') || 'all'
  const priority = searchParams.get('priority') || 'all'
  const due = searchParams.get('due') || 'all'
  const sort = searchParams.get('sort') || 'created_at'
  const direction = searchParams.get('direction') || 'desc'
  const page = Number(searchParams.get('page') || 1)

  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: lockedStatus || (status !== 'all' ? status : undefined),
      priority: priority !== 'all' ? priority : undefined,
      due: due !== 'all' ? due : undefined,
      sort,
      direction,
      page,
      per_page: 10,
    }),
    [search, lockedStatus, status, priority, due, sort, direction, page],
  )

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const { data } = await api.get('/tasks', { params })
      setTasks(data.data)
      setMeta(data.meta)
    } catch (error) {
      toast.error(extractErrors(error).general)
    } finally {
      setLoading(false)
    }
  }, [params, toast])

  useEffect(() => {
    load()
  }, [load])

  /** Update one query-string filter and reset pagination. */
  function updateParam(key, value, { resetPage = true } = {}) {
    const next = new URLSearchParams(searchParams)

    if (!value || value === 'all' || value === '') {
      next.delete(key)
    } else {
      next.set(key, value)
    }

    if (resetPage) {
      next.delete('page')
    }

    setSearchParams(next)
  }

  function handleSortChange(value) {
    const [nextSort, nextDirection] = value.split('|')
    const next = new URLSearchParams(searchParams)
    next.set('sort', nextSort)
    next.set('direction', nextDirection)
    next.delete('page')
    setSearchParams(next)
  }

  async function handleToggle(task) {
    setBusyId(task.id)

    try {
      const { data } = await api.patch(`/tasks/${task.id}/toggle`)
      toast.success(data.message)
      await load()
    } catch (error) {
      toast.error(extractErrors(error).general)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!confirm) return

    setDeleting(true)

    try {
      const { data } = await api.delete(`/tasks/${confirm.id}`)
      toast.success(data.message)
      setConfirm(null)
      await load()
    } catch (error) {
      toast.error(extractErrors(error).general)
    } finally {
      setDeleting(false)
    }
  }

  const hasFilters = Boolean(search || priority !== 'all' || due !== 'all' || (!lockedStatus && status !== 'all'))

  return (
    <>
      <div className="tm-page-head">
        <div>
          <h1 className="tm-page-title">{title}</h1>
          <p className="tm-page-subtitle">{subtitle}</p>
        </div>

        <button type="button" className="tm-btn tm-btn--primary" onClick={() => navigate('/tasks/new')}>
          <i className="bi bi-plus-lg" aria-hidden="true" /> Add New Task
        </button>
      </div>

      <section className="tm-panel">
        <form
          className="tm-toolbar"
          onSubmit={(event) => {
            event.preventDefault()
            updateParam('search', searchInput.trim())
          }}
        >
          <div className="tm-search" style={{ maxWidth: 280, minWidth: 180, flex: '1 1 200px' }}>
            <i className="bi bi-search tm-search__icon" aria-hidden="true" />
            <label className="tm-sr-only" htmlFor="taskSearch">
              Search tasks
            </label>
            <input
              id="taskSearch"
              type="search"
              className="tm-search__input"
              placeholder="Search by title or description..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          {!lockedStatus && (
            <select
              className="tm-select"
              value={status}
              onChange={(event) => updateParam('status', event.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          <select
            className="tm-select"
            value={priority}
            onChange={(event) => updateParam('priority', event.target.value)}
            aria-label="Filter by priority"
          >
            <option value="all">All priorities</option>
            {PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {option} priority
              </option>
            ))}
          </select>

          <select
            className="tm-select"
            value={due}
            onChange={(event) => updateParam('due', event.target.value)}
            aria-label="Filter by due date"
          >
            {DUE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="tm-select"
            value={`${sort}|${direction}`}
            onChange={(event) => handleSortChange(event.target.value)}
            aria-label="Sort tasks"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="tm-toolbar__spacer" />

          {hasFilters && (
            <button
              type="button"
              className="tm-btn tm-btn--ghost tm-btn--sm"
              onClick={() => {
                setSearchInput('')
                setSearchParams(new URLSearchParams())
              }}
            >
              <i className="bi bi-x-circle" aria-hidden="true" /> Clear filters
            </button>
          )}
        </form>

        <TaskTable
          tasks={tasks}
          loading={loading}
          busyId={busyId}
          onToggle={handleToggle}
          onEdit={(task) => navigate(`/tasks/${task.id}/edit`)}
          onDelete={(task) => setConfirm(task)}
          emptyState={
            <div className="tm-empty">
              <span className="tm-empty__icon" aria-hidden="true">
                <i className="bi bi-inbox" />
              </span>
              <h3 className="tm-empty__title">{emptyTitle}</h3>
              <p className="tm-empty__text">{emptyText}</p>
              <button type="button" className="tm-btn tm-btn--primary" onClick={() => navigate('/tasks/new')}>
                <i className="bi bi-plus-lg" aria-hidden="true" /> Add New Task
              </button>
            </div>
          }
        />

        <Pagination
          meta={meta}
          onPageChange={(nextPage) => {
            const next = new URLSearchParams(searchParams)
            next.set('page', String(nextPage))
            setSearchParams(next)
          }}
        />
      </section>

      <ConfirmDialog
        open={Boolean(confirm)}
        busy={deleting}
        title="Move task to trash?"
        message={confirm ? `"${confirm.title}" will be moved to the trash. You can restore it at any time.` : ''}
        confirmLabel="Move to Trash"
        onCancel={() => setConfirm(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
