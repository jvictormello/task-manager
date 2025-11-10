import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle2, Clock3, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDateTime, formatRelativeDate } from '@/utils/date';
import type { Task } from '@/types/task';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const priorityStyles: Record<Task['priority'], string> = {
  low: 'bg-sky-100 text-sky-700 border border-sky-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  high: 'bg-rose-100 text-rose-700 border border-rose-200',
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMarkComplete: (task: Task) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onMarkComplete }: TaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id.toString(),
    data: { task, columnId: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const canComplete = task.status !== 'completed';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'border border-border/70 bg-card shadow-sm transition-all',
        isDragging && 'opacity-60 ring-2 ring-primary/40',
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold leading-snug text-foreground">{task.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="Task actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(task)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {formatRelativeDate(task.dueDate)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{formatDateTime(task.dueDate)}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created {formatRelativeDate(task.createdAt)}</span>
          <span>Updated {formatRelativeDate(task.updatedAt)}</span>
        </div>

        <Button
          variant={canComplete ? 'default' : 'secondary'}
          size="sm"
          className="w-full"
          onClick={() => canComplete && onMarkComplete(task)}
          disabled={!canComplete}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" /> {canComplete ? 'Mark completed' : 'Completed'}
        </Button>
      </div>
    </Card>
  );
};
