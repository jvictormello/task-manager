import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Target } from 'lucide-react';

import type { Task, TaskStatus } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TaskCard } from './task-card';

export interface KanbanColumnDefinition {
  id: TaskStatus;
  title: string;
  description: string;
  accentClass: string;
}

interface TaskColumnProps {
  definition: KanbanColumnDefinition;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMarkComplete: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
}

export const TaskColumn = ({ definition, tasks, onEdit, onDelete, onMarkComplete, onCreateTask }: TaskColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: definition.id, data: { columnId: definition.id } });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'flex h-[calc(100vh-220px)] flex-col border border-border/70 bg-card shadow-lg transition-colors',
        isOver && 'border-primary/50 bg-primary/5',
      )}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={definition.accentClass}>
            <Target className="mr-1 h-3 w-3" />
            {definition.title}
          </Badge>
          <span className="text-xs text-muted-foreground">{tasks.length} task{tasks.length === 1 ? '' : 's'}</span>
        </div>
        <CardTitle className="text-base font-semibold text-foreground">{definition.description}</CardTitle>
        <Button variant="ghost" size="sm" className="w-full justify-start px-2 text-primary" onClick={() => onCreateTask(definition.id)}>
          <Plus className="mr-2 h-4 w-4" /> Add task
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-3 pb-4">
        <ScrollArea className="h-full pr-3">
          <SortableContext items={tasks.map((task) => task.id.toString())} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onMarkComplete={onMarkComplete} />
              ))}
              {tasks.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  No tasks yet. Use “Add task” to create one.
                </div>
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
