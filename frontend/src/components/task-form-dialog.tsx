import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { Task, TaskPayload, TaskPriority, TaskStatus } from '@/types/task';
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '@/types/task';
import { toDateTimeLocalValue, toIsoStringFromLocal } from '@/utils/date';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title must be under 100 characters'),
  description: z
    .string()
    .min(4, 'Description must be at least 4 characters')
    .max(500, 'Description must be under 500 characters'),
  status: z.union([z.literal('pending'), z.literal('in_progress'), z.literal('completed')]),
  priority: z.union([z.literal('low'), z.literal('medium'), z.literal('high')]),
  dueDate: z.string().min(1, 'Due date is required'),
});

export type TaskFormValues = z.infer<typeof schema>;

interface TaskFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialTask?: Task | null;
  defaultStatus?: TaskStatus;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TaskPayload) => Promise<void> | void;
}

export const TaskFormDialog = ({
  open,
  mode,
  initialTask,
  defaultStatus = 'pending',
  loading,
  onOpenChange,
  onSubmit,
}: TaskFormDialogProps) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: defaultStatus,
      dueDate: toDateTimeLocalValue(new Date().toISOString()),
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialTask) {
        form.reset({
          title: initialTask.title,
          description: initialTask.description,
          priority: initialTask.priority,
          status: initialTask.status,
          dueDate: toDateTimeLocalValue(initialTask.dueDate),
        });
      } else {
        form.reset({
          title: '',
          description: '',
          priority: 'medium',
          status: defaultStatus,
          dueDate: toDateTimeLocalValue(new Date().toISOString()),
        });
      }
    }
  }, [open, mode, initialTask, defaultStatus, form]);

  const submitHandler = async (values: TaskFormValues) => {
    await onSubmit({
      title: values.title,
      description: values.description,
      priority: values.priority,
      status: values.status,
      dueDate: toIsoStringFromLocal(values.dueDate),
    });
  };

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create new task' : `Edit task #${initialTask?.id}`}</DialogTitle>
          <DialogDescription>Provide clear details to keep everyone aligned.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(submitHandler)}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Design onboarding flow" {...form.register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Add context, acceptance criteria or useful links"
              {...form.register('description')}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.watch('status')} onValueChange={(value: TaskStatus) => form.setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.watch('priority')} onValueChange={(value: TaskPriority) => form.setValue('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITY_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-destructive">{errors.priority.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={form.watch('dueDate')}
              onChange={(event) => form.setValue('dueDate', event.target.value)}
            />
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create task' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
