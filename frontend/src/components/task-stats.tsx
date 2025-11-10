import { Activity, BarChart3, CheckCircle2 } from 'lucide-react';

import type { TaskStatistics } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskStatsProps {
  stats: TaskStatistics | null;
  loading: boolean;
}

const statusIcons = [CheckCircle2, Activity, BarChart3];

export const TaskStats = ({ stats, loading }: TaskStatsProps) => {
  const statusEntries = stats ? Object.entries(stats.byStatus) : [];
  const priorityEntries = stats ? Object.entries(stats.byPriority) : [];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Total tasks</CardTitle>
          <p className="text-sm text-muted-foreground">All statuses combined</p>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold tracking-tight">
            {loading ? '—' : stats?.totalTasks ?? 0}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Status breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">How work moves forward</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {statusEntries.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
          {statusEntries.map(([status, count], index) => {
            const Icon = statusIcons[index % statusIcons.length];
            return (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" /> {status.replace('_', ' ')}
                </span>
                <span className="font-semibold text-foreground">{loading ? '—' : count}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Priority focus</CardTitle>
          <p className="text-sm text-muted-foreground">Where attention is needed</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {priorityEntries.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
          {priorityEntries.map(([priority, count]) => (
            <div key={priority} className="flex items-center justify-between text-sm">
              <span className="capitalize text-muted-foreground">{priority}</span>
              <span className="font-semibold text-foreground">{loading ? '—' : count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
