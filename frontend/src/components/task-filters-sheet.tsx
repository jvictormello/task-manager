import { useState } from 'react';
import { Filter } from 'lucide-react';

import type { TaskFilters, TaskPriority, TaskStatus } from '@/types/task';
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '@/types/task';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface TaskFiltersSheetProps {
  filters: TaskFilters;
  onApply: (filters: TaskFilters) => void;
  onClear: () => void;
}

export const TaskFiltersSheet = ({ filters, onApply, onClear }: TaskFiltersSheetProps) => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<TaskFilters>(filters);

  const ANY_STATUS = 'any-status';
  const ANY_PRIORITY = 'any-priority';

  const handleChange = (field: keyof TaskFilters, value?: string | number) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value ?? undefined,
    }));
  };

  const applyFilters = () => {
    onApply(localFilters);
    setOpen(false);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onClear();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={(value) => {
      setOpen(value);
      if (value) setLocalFilters(filters);
    }}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Filter tasks</SheetTitle>
          <SheetDescription>Refine the board by attributes, priority or time range.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="filter-id">Task ID</Label>
              <Input
                id="filter-id"
                type="number"
                min={1}
                value={localFilters.id ?? ''}
                onChange={(event) => handleChange('id', event.target.value ? Number(event.target.value) : undefined)}
                placeholder="123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-title">Title contains</Label>
              <Input
                id="filter-title"
                value={localFilters.title ?? ''}
                onChange={(event) => handleChange('title', event.target.value || undefined)}
                placeholder="Design"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-description">Description contains</Label>
              <Input
                id="filter-description"
                value={localFilters.description ?? ''}
                onChange={(event) => handleChange('description', event.target.value || undefined)}
                placeholder="handoff"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={localFilters.status ?? ANY_STATUS}
                onValueChange={(value) => handleChange('status', value === ANY_STATUS ? undefined : (value as TaskStatus))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_STATUS}>Any</SelectItem>
                  {TASK_STATUS_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={localFilters.priority ?? ANY_PRIORITY}
                onValueChange={(value) => handleChange('priority', value === ANY_PRIORITY ? undefined : (value as TaskPriority))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_PRIORITY}>Any</SelectItem>
                  {TASK_PRIORITY_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Due date from</Label>
              <Input
                type="date"
                value={localFilters.due_date_from ?? ''}
                onChange={(event) => handleChange('due_date_from', event.target.value || undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label>Due date to</Label>
              <Input
                type="date"
                value={localFilters.due_date_to ?? ''}
                onChange={(event) => handleChange('due_date_to', event.target.value || undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label>Created from</Label>
              <Input
                type="date"
                value={localFilters.created_from ?? ''}
                onChange={(event) => handleChange('created_from', event.target.value || undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label>Created to</Label>
              <Input
                type="date"
                value={localFilters.created_to ?? ''}
                onChange={(event) => handleChange('created_to', event.target.value || undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label>Updated from</Label>
              <Input
                type="date"
                value={localFilters.updated_from ?? ''}
                onChange={(event) => handleChange('updated_from', event.target.value || undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label>Updated to</Label>
              <Input
                type="date"
                value={localFilters.updated_to ?? ''}
                onChange={(event) => handleChange('updated_to', event.target.value || undefined)}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="ghost" className="w-full border" onClick={clearFilters}>
            Clear filters
          </Button>
          <Button className="w-full" onClick={applyFilters}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
