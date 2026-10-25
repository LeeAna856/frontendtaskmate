import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { extractErrors } from '../lib/api'
import { useToast } from '../context/ToastContext'
import TaskTable from '../components/TaskTable'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'

export default function Trash() {
  const navigate = useNavigate()
  const toast = useToast()

  const [tasks, setTasks] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    async (page = 1) => {
      setLoading(true)

      try {
        const { data } = await api.get('/trash', { params: { page, per_page: 10 } })
        setTasks(data.data)
        setMeta(data.meta)
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

  async function handleRestore(task) {
    setBusyId(task.id)

    try {
      const { data } = await api.patch(`/trash/${task.id}/restore`)
      toast.success(data.message)
      await load(meta.current_page || 1)
    } catch (error) {
      toast.error(extractErrors(error).general)
    } finally {
      setBusyId(null)
    }
  }

  async function handleForceDelete() {
    if (!confirm) return

    setBusy(true)

    try {
      const { data } = await api.delete(`/trash/${confirm.id}`)
      toast.success(data.message)
      setConfirm(null)
      await load(meta.current_page || 1)
    } catch (error) {
      toast.error(extractErrors(error).general)
    } finally {
      setBusy(false)
    }
  }

  async function handleRestoreAll() {
    setBusy(true)

    try {
      const { data } = await api.post('/trash/restore-all')
      toast.success(data.message)
      await load(1)
    } catch (error) {
      toast.error(extractErrors(error).general)
    } finally {
      setBusy(false)
    }
  }

  async function handleEmptyTrash() {
    setBusy(true)

    try {
      const { data } = await api.post('/trash/empty')
      toast.success(data.message)
      setConfirm('empty')
      await load(1)
    } catch (error) {
      toast.error(extractErrors(error).general)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="tm-page-head">
        <div>
          <h1 className="tm-page-title">Trash</h1>
          <p className="tm-page-subtitle">Deleted tasks are kept here until you permanently remove them.</p>
        </div>

        <div className="tm-row">
          <button type="button" className="tm-btn tm-btn--secondary tm-btn--sm" onClick={handleRestoreAll} disabled={busy || !tasks.length}>
            <i className="bi bi-arrow-counterclockwise" aria-hidden="true" /> Restore All
          </button>
          <button
            type="button"
            className="tm-btn tm-btn--danger-soft tm-btn--sm"
            onClick={() => setConfirm('empty')}
            disabled={busy || !tasks.length}
          >
            <i className="bi bi-trash3" aria-hidden="true" /> Empty Trash
          </button>
        </div>
      </div>

      <section className="tm-panel">
        <TaskTable
          tasks={tasks}
          loading={loading}
          busyId={busyId}
          mode="trash"
          showCheckbox={false}
          onRestore={handleRestore}
          onForceDelete={(task) => setConfirm(task)}
          emptyState={
            <div className="tm-empty">
              <span className="tm-empty__icon" aria-hidden="true">
                <i className="bi bi-trash3" />
              </span>
              <h3 className="tm-empty__title">The trash is empty</h3>
              <p className="tm-empty__text">Tasks you delete will appear here so you can restore them later.</p>
              <button type="button" className="tm-btn tm-btn--primary" onClick={() => navigate('/tasks')}>
                <i className="bi bi-arrow-left" aria-hidden="true" /> Back to tasks
              </button>
            </div>
          }
        />

        <Pagination meta={meta} onPageChange={(page) => load(page)} />
      </section>

      <ConfirmDialog
        open={Boolean(confirm)}
        busy={busy}
        title={confirm === 'empty' ? 'Empty the trash?' : 'Delete permanently?'}
        message={
          confirm === 'empty'
            ? 'Every task in the trash will be permanently deleted. This cannot be undone.'
            : confirm
              ? `"${confirm.title}" will be permanently deleted. This action cannot be undone.`
              : ''
        }
        confirmLabel={confirm === 'empty' ? 'Empty Trash' : 'Delete Permanently'}
        onCancel={() => setConfirm(null)}
        onConfirm={confirm === 'empty' ? handleEmptyTrash : handleForceDelete}
      />
    </>
  )
}
