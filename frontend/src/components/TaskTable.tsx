import type { Task, TaskPriority, TaskStatus } from '../types/task';
import { formatDateTime, formatRelativeDate } from '../utils/date';
import './TaskTable.css';

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMarkComplete: (task: Task) => void;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (field: 'id' | 'title' | 'created_at' | 'updated_at' | 'due_date') => void;
}

const statusBadgeClass: Record<TaskStatus, string> = {
  pending: 'badge badge--pending',
  in_progress: 'badge badge--progress',
  completed: 'badge badge--completed',
};

const priorityBadgeClass: Record<TaskPriority, string> = {
  low: 'badge badge--low',
  medium: 'badge badge--medium',
  high: 'badge badge--high',
};

const headers: { key: 'id' | 'title' | 'due_date' | 'created_at' | 'updated_at'; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'due_date', label: 'Due date' },
  { key: 'created_at', label: 'Created' },
  { key: 'updated_at', label: 'Updated' },
];

const EditIcon = () => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 20 20" fill="none">
    <path
      d="M4 13.5V16h2.5l7.36-7.36-2.5-2.5L4 13.5zm11.81-6.31a.7.7 0 0 0 0-.99l-2.01-2.01a.7.7 0 0 0-.99 0l-1.57 1.57 2.5 2.5 2.07-2.07z"
      fill="currentColor"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 20 20" fill="none">
    <path
      d="M7 4h6l.7 1H17v2h-1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7H3V5h3l1-1zm1 5v6h2V9H8zm4 0v6h2V9h-2z"
      fill="currentColor"
    />
  </svg>
);

const CheckIcon = () => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 20 20" fill="none">
    <path
      d="M7.78 13.44 4.34 10l1.41-1.41 2.03 2.03 6.48-6.48L15.66 5l-7.88 8.44z"
      fill="currentColor"
    />
  </svg>
);

const TaskTable = ({ tasks, loading, onEdit, onDelete, onMarkComplete, sortBy, sortDir, onSort }: TaskTableProps) => {
  return (
    <div className="task-table__wrapper">
      <table className="task-table">
        <caption className="sr-only">Tasks</caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header.key} scope="col">
                <button
                  type="button"
                  onClick={() => onSort(header.key)}
                  className={sortBy === header.key ? `is-active sort-${sortDir}` : ''}
                  aria-label={`Sort by ${header.label}`}
                >
                  {header.label}
                </button>
              </th>
            ))}
            <th scope="col">Status</th>
            <th scope="col">Priority</th>
            <th scope="col" className="task-table__actions-header">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="task-table__loading">
                Loading tasks...
              </td>
            </tr>
          ) : tasks.length === 0 ? (
            <tr>
              <td colSpan={8} className="task-table__empty">
                No tasks found with current filters.
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td className="task-table__title">
                  <span>{task.title}</span>
                  <p className="task-table__description">{task.description}</p>
                </td>
                <td>
                  <span>{formatDateTime(task.dueDate)}</span>
                  <p className="task-table__meta">{formatRelativeDate(task.dueDate)}</p>
                </td>
                <td>{formatDateTime(task.createdAt)}</td>
                <td>{formatDateTime(task.updatedAt)}</td>
                <td>
                  <span className={statusBadgeClass[task.status]}>{task.status.replace('_', ' ')}</span>
                </td>
                <td>
                  <span className={priorityBadgeClass[task.priority]}>{task.priority}</span>
                </td>
                <td className="task-table__actions">
                  <button
                    type="button"
                    className="action-button action-button--edit"
                    onClick={() => onEdit(task)}
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="action-button action-button--delete"
                    onClick={() => onDelete(task)}
                  >
                    <DeleteIcon />
                    <span>Delete</span>
                  </button>
                  <button
                    type="button"
                    className={`action-button action-button--complete${task.status === 'completed' ? ' is-disabled' : ''}`}
                    onClick={() => onMarkComplete(task)}
                    disabled={task.status === 'completed'}
                  >
                    <CheckIcon />
                    <span>{task.status === 'completed' ? 'Completed' : 'Mark completed'}</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
