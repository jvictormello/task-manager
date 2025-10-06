import { useCallback, useEffect, useState } from 'react';
import TaskFiltersPanel from './components/TaskFilters';
import TaskTable from './components/TaskTable';
import TaskFormModal from './components/TaskFormModal';
import ConfirmDialog from './components/ConfirmDialog';
import FeedbackBanner from './components/FeedbackBanner';
import StatsPanel from './components/StatsPanel';
import Spinner from './components/Spinner';
import type { Task, TaskFilters, TaskListResponse, TaskPayload, TaskStatistics } from './types/task';
import { ApiError, taskApi } from './services/api';
import './App.css';

const DEFAULT_PER_PAGE = 10;
const PER_PAGE_OPTIONS = [10, 20, 50];

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [pagination, setPagination] = useState<TaskListResponse['meta'] | null>(null);

  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'due_date' | 'id' | 'title'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [savingTask, setSavingTask] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const response = await taskApi.list({
        ...filters,
        sortBy,
        sortDir,
        perPage,
        page,
      });
      setTasks(response.data);
      setPagination(response.meta);
      if (response.meta.current_page !== page) {
        setPage(response.meta.current_page);
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof ApiError ? error.message : 'Unable to load tasks. Please try again.';
      setFeedback({ type: 'error', message });
      setPagination(null);
    } finally {
      setLoadingTasks(false);
    }
  }, [filters, sortBy, sortDir, page, perPage]);

  const loadStatistics = useCallback(async () => {
    setLoadingStats(true);
    try {
      const stats = await taskApi.statistics();
      setStatistics(stats);
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Unable to load statistics.' });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = async (payload: TaskPayload, id?: number) => {
    setSavingTask(true);
    try {
      if (modalMode === 'edit' && id) {
        await taskApi.update(id, payload);
        setFeedback({ type: 'success', message: 'Task updated successfully.' });
      } else {
        await taskApi.create(payload);
        setFeedback({ type: 'success', message: 'Task created successfully.' });
      }
      await Promise.all([loadTasks(), loadStatistics()]);
    } finally {
      setSavingTask(false);
    }
  };

  const handleRequestMarkComplete = (task: Task) => {
    setTaskToComplete(task);
    setCompleteConfirmOpen(true);
  };

  const handleConfirmMarkComplete = async () => {
    if (!taskToComplete) return;
    setCompleteLoading(true);
    try {
      await taskApi.update(taskToComplete.id, {
        title: taskToComplete.title,
        description: taskToComplete.description,
        priority: taskToComplete.priority,
        status: 'completed',
        dueDate: taskToComplete.dueDate,
      });
      setFeedback({ type: 'success', message: `Task #${taskToComplete.id} marked as completed.` });
      await Promise.all([loadTasks(), loadStatistics()]);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to update task.';
      setFeedback({ type: 'error', message });
    } finally {
      setCompleteLoading(false);
      setCompleteConfirmOpen(false);
      setTaskToComplete(null);
    }
  };

  const handleCancelMarkComplete = () => {
    setCompleteConfirmOpen(false);
    setTaskToComplete(null);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setDeleteLoading(true);
    try {
      await taskApi.delete(selectedTask.id);
      setFeedback({ type: 'success', message: `Task #${selectedTask.id} deleted.` });
      await Promise.all([loadTasks(), loadStatistics()]);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to delete task.';
      setFeedback({ type: 'error', message });
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setSelectedTask(null);
    }
  };

  const handleApplyFilters = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleSort = (field: 'id' | 'title' | 'created_at' | 'updated_at' | 'due_date') => {
    setSortDir((prevDir) => {
      const isSameField = sortBy === field;
      const nextDir = isSameField ? (prevDir === 'asc' ? 'desc' : 'asc') : 'asc';
      setSortBy(field);
      return nextDir;
    });
    setPage(1);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (!pagination) return;
    const clamped = Math.max(1, Math.min(nextPage, pagination.last_page));
    if (clamped !== page) {
      setPage(clamped);
    }
  };

  const totalTasks = pagination?.total ?? tasks.length;
  const showingFrom = pagination?.from ?? (tasks.length > 0 ? 1 : 0);
  const showingTo = pagination?.to ?? tasks.length;

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Task Manager</h1>
          <p>Plan, track, and complete your tasks efficiently.</p>
        </div>
        <button type="button" className="button button--primary" onClick={openCreateModal}>
          + New task
        </button>
      </header>

      {feedback && (
        <FeedbackBanner
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <StatsPanel stats={statistics} loading={loadingStats} />

      <TaskFiltersPanel
        initialFilters={filters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      <section aria-labelledby="tasks-heading">
        <div className="app__table-header">
          <h2 id="tasks-heading">Tasks</h2>
          <div className="app__table-actions">
            <label className="app__per-page" htmlFor="per-page-select">
              <span>Per page</span>
              <select
                id="per-page-select"
                value={perPage}
                onChange={(event) => handlePerPageChange(Number(event.target.value))}
              >
                {PER_PAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            {loadingTasks && (
              <span className="app__loading">
                <Spinner />
                <span>Loading...</span>
              </span>
            )}
          </div>
        </div>
        <TaskTable
          tasks={tasks}
          loading={loadingTasks}
          onEdit={openEditModal}
          onDelete={(task) => {
            setSelectedTask(task);
            setConfirmOpen(true);
          }}
          onMarkComplete={handleRequestMarkComplete}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
        {pagination && (
          <div className="app__pagination">
            <div className="app__pagination-info">
              {totalTasks > 0
                ? `Showing ${showingFrom}–${showingTo} of ${totalTasks} tasks`
                : 'No tasks to display'}
            </div>
            <div className="app__pagination-controls">
              <button
                type="button"
                className="button button--ghost"
                disabled={!pagination || pagination.current_page === 1}
                onClick={() => handlePageChange((pagination?.current_page ?? 1) - 1)}
              >
                Previous
              </button>
              <span className="app__pagination-page">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                type="button"
                className="button button--ghost"
                disabled={!pagination || pagination.current_page === pagination.last_page}
                onClick={() => handlePageChange((pagination?.current_page ?? 1) + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      <TaskFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveTask}
        submitting={savingTask}
        mode={modalMode}
        initialTask={selectedTask}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete task"
        description={`Are you sure you want to delete task #${selectedTask?.id}? This will soft delete the task.`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={() => void handleDeleteTask()}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedTask(null);
        }}
      />

      <ConfirmDialog
        isOpen={completeConfirmOpen}
        title="Mark task as completed"
        description={`Mark task #${taskToComplete?.id} as completed?`}
        confirmLabel="Mark completed"
        loading={completeLoading}
        onConfirm={() => void handleConfirmMarkComplete()}
        onCancel={handleCancelMarkComplete}
      />
    </div>
  );
};

export default App;
