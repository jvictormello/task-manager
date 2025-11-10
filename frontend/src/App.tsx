import { useMemo, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownUp, Loader2 } from 'lucide-react';

import type { Task, TaskFilters, TaskPayload, TaskStatus } from '@/types/task';
import { TaskColumn, type KanbanColumnDefinition } from '@/components/kanban/task-column';
import { TaskFormDialog } from '@/components/task-form-dialog';
import { TaskFiltersSheet } from '@/components/task-filters-sheet';
import { TaskStats } from '@/components/task-stats';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { taskApi } from '@/services/api';
import type { TaskStatistics } from '@/types/task';

const KANBAN_COLUMNS: KanbanColumnDefinition[] = [
  {
    id: 'pending',
    title: 'To Do',
    description: 'Ideas, backlog items and fresh requests.',
    accentClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    description: 'Work that is currently being tackled.',
    accentClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'completed',
    title: 'Done',
    description: 'Delivered and signed-off tasks.',
    accentClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

const App = () => {
  const queryClientInstance = useQueryClient();
  const { toast } = useToast();

  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortBy, setSortBy] = useState<'due_date' | 'created_at'>('due_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formDefaultStatus, setFormDefaultStatus] = useState<TaskStatus>('pending');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const { data: taskListResponse, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', filters, sortBy, sortDir],
    queryFn: () =>
      taskApi.list({
        ...filters,
        sort_by: sortBy,
        sort_dir: sortDir,
        per_page: 200,
      }),
  });

  const { data: stats, isLoading: loadingStats } = useQuery<TaskStatistics>({
    queryKey: ['tasks', 'stats'],
    queryFn: () => taskApi.statistics(),
  });

  const tasks = taskListResponse?.data ?? [];

  const groupedTasks = useMemo(() => {
    return KANBAN_COLUMNS.reduce<Record<TaskStatus, Task[]>>((acc, column) => {
      acc[column.id] = tasks
        .filter((task) => task.status === column.id)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  const invalidateData = () => {
    queryClientInstance.invalidateQueries({ queryKey: ['tasks'] });
    queryClientInstance.invalidateQueries({ queryKey: ['tasks', 'stats'] });
  };

  const createTaskMutation = useMutation({
    mutationFn: (payload: TaskPayload) => taskApi.create(payload),
    onSuccess: () => {
      invalidateData();
      toast({ title: 'Task created', description: 'The task has been added to the board.' });
      setFormOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Unable to create the task', description: error.message, variant: 'destructive' });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TaskPayload }) => taskApi.update(id, payload),
    onSuccess: () => {
      invalidateData();
      toast({ title: 'Task updated', description: 'Changes saved successfully.' });
      setFormOpen(false);
      setEditingTask(null);
    },
    onError: (error) => {
      toast({ title: 'Unable to update task', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => {
      invalidateData();
      toast({ title: 'Task deleted', description: 'The task was moved out of the board.' });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast({ title: 'Unable to delete task', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmitTask = async (values: TaskPayload) => {
    if (formMode === 'edit' && editingTask) {
      await updateTaskMutation.mutateAsync({ id: editingTask.id, payload: values });
    } else {
      await createTaskMutation.mutateAsync(values);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormMode('edit');
    setFormDefaultStatus(task.status);
    setFormOpen(true);
  };

  const handleCreateTask = (status: TaskStatus) => {
    setEditingTask(null);
    setFormMode('create');
    setFormDefaultStatus(status);
    setFormOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setDeleteTarget(task);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteTaskMutation.mutate(deleteTarget.id);
    }
  };

  const handleMarkComplete = (task: Task) => {
    if (task.status === 'completed') return;
    updateTaskMutation.mutate({
      id: task.id,
      payload: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: 'completed',
        dueDate: task.dueDate,
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = active.data.current?.task as Task | undefined;
    if (!activeTask) return;

    const destinationColumn = (over.data.current?.columnId ?? over.data.current?.task?.status) as TaskStatus | undefined;
    if (!destinationColumn || destinationColumn === activeTask.status) return;

    updateTaskMutation.mutate({
      id: activeTask.id,
      payload: {
        title: activeTask.title,
        description: activeTask.description,
        priority: activeTask.priority,
        status: destinationColumn,
        dueDate: activeTask.dueDate,
      },
    });
  };

  const onApplyFilters = (nextFilters: TaskFilters) => {
    setFilters(nextFilters);
  };

  const onClearFilters = () => {
    setFilters({});
  };

  const tasksLoadingState = loadingTasks && tasks.length === 0;

  return (
    <TooltipProvider>
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground">Team workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Kanban planner</h1>
            <p className="text-muted-foreground">Visualize the flow of work and stay aligned on delivery.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TaskFiltersSheet filters={filters} onApply={onApplyFilters} onClear={onClearFilters} />
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: 'due_date' | 'created_at') => setSortBy(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_date">Due date</SelectItem>
                  <SelectItem value="created_at">Created</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" onClick={() => setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))}>
                <ArrowDownUp className="h-4 w-4" /> {sortDir === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </div>
            <Button onClick={() => handleCreateTask('pending')}>New task</Button>
          </div>
        </header>

        <TaskStats stats={stats ?? null} loading={loadingStats} />

        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-4">
          {tasksLoadingState ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading tasks...
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <div className="grid gap-4 lg:grid-cols-3">
                {KANBAN_COLUMNS.map((column) => (
                  <TaskColumn
                    key={column.id}
                    definition={column}
                    tasks={groupedTasks[column.id] ?? []}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onMarkComplete={handleMarkComplete}
                    onCreateTask={handleCreateTask}
                  />
                ))}
              </div>
            </DndContext>
          )}
        </div>

        <TaskFormDialog
          open={formOpen}
          mode={formMode}
          initialTask={editingTask ?? undefined}
          defaultStatus={formDefaultStatus}
          loading={createTaskMutation.isPending || updateTaskMutation.isPending}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingTask(null);
          }}
          onSubmit={handleSubmitTask}
        />

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete task #{deleteTarget?.id}? This action can be undone from backups but is not recommended.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleConfirmDelete}
                disabled={deleteTaskMutation.isPending}
              >
                {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default App;
