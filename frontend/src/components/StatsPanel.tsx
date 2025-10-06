import type { TaskStatistics, TaskPriority, TaskStatus } from '../types/task';
import './StatsPanel.css';

interface StatsPanelProps {
  stats: TaskStatistics | null;
  loading: boolean;
}

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const StatsPanel = ({ stats, loading }: StatsPanelProps) => {
  return (
    <section className="stats">
      <article className="stats__card">
        <p className="stats__label">Total tasks</p>
        <p className="stats__value">{loading ? '—' : stats?.totalTasks ?? 0}</p>
      </article>
      <article className="stats__card">
        <p className="stats__label">By status</p>
        <ul className="stats__list" aria-live="polite">
          {Object.entries(statusLabels).map(([key, label]) => (
            <li key={key}>
              <span>{label}</span>
              <strong>{loading ? '—' : stats?.byStatus?.[key as TaskStatus] ?? 0}</strong>
            </li>
          ))}
        </ul>
      </article>
      <article className="stats__card">
        <p className="stats__label">By priority</p>
        <ul className="stats__list">
          {Object.entries(priorityLabels).map(([key, label]) => (
            <li key={key}>
              <span>{label}</span>
              <strong>{loading ? '—' : stats?.byPriority?.[key as TaskPriority] ?? 0}</strong>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};

export default StatsPanel;
