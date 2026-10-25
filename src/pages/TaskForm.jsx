import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api, { extractErrors } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { PRIORITIES, STATUSES } from '../lib/tasks'
import { Select, TextArea, TextInput } from '../components/FormFields'

const EMPTY_FORM = {
  title: '',
  description: '',
  due_date: '',
  priority: 'Medium',
  status: 'Not Started',
}

/**
 * Add New Task / Edit Task screen. The same form powers both modes.
 */
export default function TaskForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const isEdit = Boolean(id)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (!isEdit) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadTask() {
      setLoading(true)

      try {
        const { data } = await api.get(`/tasks/${id}`)

        if (cancelled) return

        setForm({
          title: data.task.title || '',
          description: data.task.description || '',
          due_date: data.task.due_date || '',
          priority: data.task.priority || 'Medium',
          status: data.task.status || 'Not Started',
        })
      } catch (error) {
        if (!cancelled) {
          setLoadError(extractErrors(error).general)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadTask()

    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, general: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      due_date: form.due_date || null,
      priority: form.priority,
      status: form.status,
    }

    try {
      if (isEdit) {
        const { data } = await api.put(`/tasks/${id}`, payload)
        toast.success(data.message || 'Task updated successfully.')
      } else {
        const { data } = await api.post('/tasks', payload)
        toast.success(data.message || 'Task created successfully.')
      }

      navigate('/tasks')
    } catch (error) {
      setErrors(extractErrors(error))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="tm-loading">
        <span className="tm-spinner" aria-hidden="true" />
        <span>Loading task...</span>
      </div>
    )
  }

  if (loadError) {
    return (
      <section className="tm-form-card">
        <div className="tm-form-card__body">
          <div className="tm-alert tm-alert--error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
            <span>{loadError}</span>
          </div>
          <button type="button" className="tm-btn tm-btn--secondary" onClick={() => navigate('/tasks')}>
            <i className="bi bi-arrow-left" aria-hidden="true" /> Back to tasks
          </button>
        </div>
      </section>
    )
  }

  return (
    <div>
      <div className="tm-page-head">
        <div>
          <h1 className="tm-page-title">{isEdit ? 'Edit Task' : 'Add New Task'}</h1>
          <p className="tm-page-subtitle">
            {isEdit ? 'Update the details of this task.' : 'Capture what needs to get done next.'}
          </p>
        </div>
      </div>

      <section className="tm-form-card">
        <div className="tm-form-card__head">
          <h2>Task details</h2>
          <p>Fields marked with an asterisk are required.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="tm-form-card__body">
            {errors.general && (
              <div className="tm-alert tm-alert--error" role="alert">
                <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="tm-form">
              <TextInput
                label="Task Title"
                name="title"
                required
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                error={errors.title}
                placeholder="e.g. Prepare the quarterly report"
                maxLength={255}
                autoFocus
              />

              <TextArea
                label="Description"
                name="description"
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                error={errors.description}
                placeholder="Add any extra details, notes or links..."
                maxLength={5000}
                hint="Optional. Helps you remember what the task involves."
              />

              <div className="tm-field-row">
                <TextInput
                  label="Due Date"
                  name="due_date"
                  type="date"
                  value={form.due_date}
                  onChange={(event) => update('due_date', event.target.value)}
                  error={errors.due_date}
                  hint="Optional."
                />

                <Select
                  label="Priority"
                  name="priority"
                  required
                  value={form.priority}
                  onChange={(event) => update('priority', event.target.value)}
                  error={errors.priority}
                  options={PRIORITIES.map((option) => ({ value: option, label: option }))}
                />
              </div>

              <Select
                label="Status"
                name="status"
                required
                value={form.status}
                onChange={(event) => update('status', event.target.value)}
                error={errors.status}
                options={STATUSES.map((option) => ({ value: option, label: option }))}
              />
            </div>
          </div>

          <div className="tm-form-card__foot">
            <button type="button" className="tm-btn tm-btn--secondary" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="tm-btn tm-btn--primary" disabled={submitting}>
              {submitting && <span className="tm-btn__spinner" aria-hidden="true" />}
              {submitting ? 'Saving...' : isEdit ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
