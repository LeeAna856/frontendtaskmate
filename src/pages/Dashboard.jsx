import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { extractErrors } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { dueLabel, formatDate, priorityClass, statusClass } from '../lib/tasks'
import SummaryCards from '../components/SummaryCards'
import TaskTable from '../components/TaskTable'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'

export default function Dashboard() {
  const navigate = useNavigate()
  const toast = useToast()

  const [stats, setStats] = useState({})
  const [upcoming, setUpcoming] = useState([])
  const [recent, setRecent] = useState([])
  const [tasks, setTasks] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(
    async (page = 1) => {
      setLoading(true)

      try {
        const [dashboard, list] = await Promise.all([
          api.get('/dashboard'),
          api.get('/tasks', { params: { per_page: 10, page, sort: 'created_at', direction: 'desc' } }),
        ])

        setStats(dashboard.data.stats)
        setUpcoming(dashboard.data.upcoming || [])
        setRecent(dashboard.data.recent || [])
        setTasks(list.data.data)
        setMeta(list.data.meta)
      } catch (error) {
        toast.error(extractErrors(error).general)
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    load()
  }, [load])

  async function handleToggle(task) {
    setBusyId(task.id)

    try {
      const { data } = await api.patch(`/tasks/${task.id}/toggle`)
      toast.success(data.message)
      await load(meta.current_page || 1)
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
      await load(meta.current_page || 1)
    } catch (error) {
      toast.error(extractErrors(error).general)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="tm-page-head">
        <div>
          <h1 className="tm-page-title">My Tasks</h1>
          <p className="tm-page-subtitle">Track what needs doing and stay on top of your workload.</p>
        </div>
      </div>

      <SummaryCards stats={stats} />

      <div className="tm-two-col">
        <section className="tm-panel">
          <div className="tm-panel__head">
            <h2 className="tm-panel__title">Recent tasks</h2>
            <button type="button" className="tm-btn tm-btn--ghost tm-btn--sm" onClick={() => navigate('/tasks')}>
              View all <i className="bi bi-arrow-right" aria-hidden="true" />
            </button>
          </div>

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
                  <i className="bi bi-clipboard2-check" />
                </span>
                <h3 className="tm-empty__title">No tasks yet</h3>
                <p className="tm-empty__text">You have not created any tasks. Add your first task to get started.</p>
                <button type="button" className="tm-btn tm-btn--primary" onClick={() => navigate('/tasks/new')}>
                  <i className="bi bi-plus-lg" aria-hidden="true" /> Add New Task
                </button>
              </div>
            }
          />

          <Pagination meta={meta} onPageChange={(page) => load(page)} />
        </section>

        <aside className="tm-stack">
          <section className="tm-panel">
            <div className="tm-panel__head">
              <h2 className="tm-panel__title">Due soon</h2>
              <span className="tm-chip">Next 5</span>
            </div>
            <div className="tm-panel__body">
              {loading ? (
                <div className="tm-loading" style={{ padding: '24px 0' }}>
                  <span className="tm-spinner" aria-hidden="true" />
                </div>
              ) : upcoming.length === 0 ? (
                <p className="tm-hint" style={{ textAlign: 'center', margin: 0 }}>
                  Nothing scheduled. Add a due date to see upcoming work here.
                </p>
              ) : (
                <div className="tm-quick-list">
                  {upcoming.map((task) => {
                    const due = dueLabel(task)

                    return (
                      <button
                        type="button"
                        key={task.id}
                        className="tm-quick-item"
                        style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={() => navigate(`/tasks/${task.id}/edit`)}
                      >
                        <span
                          className={`tm-stat__icon tm-stat__icon--${task.priority === 'High' ? 'red' : 'blue'}`}
                          style={{ width: 34, height: 34, fontSize: 14 }}
                        >
                          <i className="bi bi-calendar-event" aria-hidden="true" />
                        </span>
                        <span className="tm-quick-item__body">
                          <span className="tm-quick-item__title">{task.title}</span>
                          <span className={`tm-due tm-due--${due.tone}`} style={{ fontSize: 12 }}>
                            {formatDate(task.due_date)} &middot; {task.priority}
                          </span>
                        </span>
                        <span className={statusClass(task.status)}>
                          {task.status === 'In Progress' ? 'Active' : task.status}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="tm-panel">
            <div className="tm-panel__head">
              <h2 className="tm-panel__title">Recently added</h2>
            </div>
            <div className="tm-panel__body">
              {loading ? (
                <div className="tm-loading" style={{ padding: '24px 0' }}>
                  <span className="tm-spinner" aria-hidden="true" />
                </div>
              ) : recent.length === 0 ? (
                <p className="tm-hint" style={{ textAlign: 'center', margin: 0 }}>
                  No tasks yet.
                </p>
              ) : (
                <div className="tm-quick-list">
                  {recent.map((task) => (
                    <div className="tm-quick-item" key={task.id}>
                      <span
                        className={`tm-stat__icon tm-stat__icon--${task.priority === 'High' ? 'red' : 'blue'}`}
                        style={{ width: 34, height: 34, fontSize: 14 }}
                      >
                        <i className="bi bi-list-task" aria-hidden="true" />
                      </span>
                      <span className="tm-quick-item__body">
                        <span className="tm-quick-item__title">{task.title}</span>
                        <span className="tm-hint">Added {formatDate(task.created_at?.slice(0, 10))}</span>
                      </span>
                      <span className={priorityClass(task.priority)}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

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
