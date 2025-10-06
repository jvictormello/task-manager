import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { TaskFilters } from '../types/task';
import './TaskFilters.css';

interface TaskFiltersProps {
  initialFilters: TaskFilters;
  onApply: (filters: TaskFilters) => void;
  onClear: () => void;
}

const TaskFiltersPanel = ({ initialFilters, onApply, onClear }: TaskFiltersProps) => {
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleChange = (field: keyof TaskFilters) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setFilters((prev) => ({
      ...prev,
      [field]: value
        ? field === 'id'
          ? Number(value)
          : value
        : undefined,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply(filters);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  return (
    <form className="task-filters" onSubmit={handleSubmit}>
      <div className="task-filters__grid">
        <div className="task-filters__field">
          <label htmlFor="filter-id">ID</label>
          <input id="filter-id" type="number" value={filters.id ?? ''} onChange={handleChange('id')} min={1} />
        </div>
        <div className="task-filters__field">
          <label htmlFor="filter-title">Title</label>
          <input id="filter-title" type="text" value={filters.title ?? ''} onChange={handleChange('title')} />
        </div>
        <div className="task-filters__field">
          <label htmlFor="filter-description">Description</label>
          <input id="filter-description" type="text" value={filters.description ?? ''} onChange={handleChange('description')} />
        </div>
        <div className="task-filters__field">
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" value={filters.status ?? ''} onChange={handleChange('status')}>
            <option value="">Any</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="task-filters__field">
          <label htmlFor="filter-priority">Priority</label>
          <select id="filter-priority" value={filters.priority ?? ''} onChange={handleChange('priority')}>
            <option value="">Any</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="task-filters__field">
          <label htmlFor="filter-due-from">Due From</label>
          <input id="filter-due-from" type="date" value={filters.due_date_from ?? ''} onChange={handleChange('due_date_from')} />
        </div>
        <div className="task-filters__field">
          <label htmlFor="filter-due-to">Due To</label>
          <input id="filter-due-to" type="date" value={filters.due_date_to ?? ''} onChange={handleChange('due_date_to')} />
        </div>
        <div className="task-filters__field">
          <label htmlFor="filter-created-from">Created From</label>
          <input id="filter-created-from" type="date" value={filters.created_from ?? ''} onChange={handleChange('created_from')} />
        </div>
        <div className="task-filters__field">
          <label htmlFor="filter-created-to">Created To</label>
          <input id="filter-created-to" type="date" value={filters.created_to ?? ''} onChange={handleChange('created_to')} />
        </div>
        <div className="task-filters__field">
          <label htmlFor="filter-updated-from">Updated From</label>
          <input id="filter-updated-from" type="date" value={filters.updated_from ?? ''} onChange={handleChange('updated_from')} />
        </div>
        <div className="task-filters__field">
          <label htmlFor="filter-updated-to">Updated To</label>
          <input id="filter-updated-to" type="date" value={filters.updated_to ?? ''} onChange={handleChange('updated_to')} />
        </div>
      </div>

      <div className="task-filters__actions">
        <button type="button" className="button button--ghost" onClick={handleClear}>
          Clear filters
        </button>
        <button type="submit" className="button button--secondary">
          Apply filters
        </button>
      </div>
    </form>
  );
};

export default TaskFiltersPanel;
