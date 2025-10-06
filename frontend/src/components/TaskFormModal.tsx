import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Modal from './Modal';
import type { Task, TaskPayload, TaskPriority, TaskStatus } from '../types/task';
import { ApiError } from '../services/api';
import type { ApiErrorData } from '../services/api';
import { toDateTimeLocalValue, toIsoStringFromLocal } from '../utils/date';
import Spinner from './Spinner';
import './TaskFormModal.css';

type FormErrors = Record<string, string>;

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: TaskPayload, id?: number) => Promise<void>;
  submitting: boolean;
  mode: 'create' | 'edit';
  initialTask?: Task | null;
}

const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

const priorityOptions: { label: string; value: TaskPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const emptyPayload: TaskPayload = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  dueDate: new Date().toISOString(),
};

const TaskFormModal = ({ isOpen, onClose, onSubmit, submitting, mode, initialTask }: TaskFormModalProps) => {
  const [payload, setPayload] = useState<TaskPayload>(emptyPayload);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && initialTask) {
      setPayload({
        title: initialTask.title,
        description: initialTask.description,
        status: initialTask.status,
        priority: initialTask.priority,
        dueDate: initialTask.dueDate,
      });
      setFormErrors({});
      setSubmitError(null);
    } else if (mode === 'create' && isOpen) {
      setPayload({ ...emptyPayload, dueDate: new Date().toISOString() });
      setFormErrors({});
      setSubmitError(null);
    }
  }, [mode, initialTask, isOpen]);

  const handleChange = (field: keyof TaskPayload) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setPayload((prev) => ({ ...prev, [field]: field === 'dueDate' ? toIsoStringFromLocal(value) : value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormErrors({});
    setSubmitError(null);

    try {
      await onSubmit(payload, initialTask?.id);
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        const data = error.data as ApiErrorData | undefined;
        if (data?.errors) {
          const mappedErrors: FormErrors = Object.entries(data.errors).reduce((acc, [field, messages]) => {
            acc[field] = messages.join(' ');
            return acc;
          }, {} as FormErrors);
          setFormErrors(mappedErrors);
        }
        setSubmitError(data?.message ?? error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Unexpected error while saving task.');
      }
    }
  };

  const dueDateError = formErrors.due_date ?? formErrors.dueDate;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Create Task' : 'Edit Task'}>
      <form className="task-form" onSubmit={handleSubmit}>
        <div className="task-form__field">
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            type="text"
            value={payload.title}
            onChange={handleChange('title')}
            required
            maxLength={100}
          />
          {formErrors.title && <span className="task-form__error">{formErrors.title}</span>}
        </div>

        <div className="task-form__field">
          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            value={payload.description}
            onChange={handleChange('description')}
            required
            maxLength={500}
            rows={4}
          />
          {formErrors.description && <span className="task-form__error">{formErrors.description}</span>}
        </div>

        <div className="task-form__grid">
          <div className="task-form__field">
            <label htmlFor="task-status">Status</label>
            <select id="task-status" value={payload.status} onChange={handleChange('status')}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="task-form__field">
            <label htmlFor="task-priority">Priority</label>
            <select id="task-priority" value={payload.priority} onChange={handleChange('priority')}>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="task-form__field">
          <label htmlFor="task-due-date">Due Date</label>
          <input
            id="task-due-date"
            type="datetime-local"
            value={toDateTimeLocalValue(payload.dueDate)}
            onChange={handleChange('dueDate')}
            required
          />
          {dueDateError && <span className="task-form__error">{dueDateError}</span>}
        </div>

        {submitError && <div className="task-form__submit-error" role="alert">{submitError}</div>}

        <div className="task-form__actions">
          <button type="button" className="button button--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="button button--primary" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner />
                <span>Saving...</span>
              </>
            ) : (
              <span>{mode === 'create' ? 'Create Task' : 'Save Changes'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
