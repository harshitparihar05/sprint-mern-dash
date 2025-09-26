import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/task";
import { Calendar, Edit, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

const priorityColors = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive"
};

const statusColors = {
  pending: "bg-muted text-muted-foreground",
  'in-progress': "bg-primary/10 text-primary",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getNextStatus = (currentStatus: Task['status']): Task['status'] => {
    switch (currentStatus) {
      case 'pending': return 'in-progress';
      case 'in-progress': return 'completed';
      case 'completed': return 'pending';
      default: return 'pending';
    }
  };

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
              <Badge variant="outline" className={statusColors[task.status]}>
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {task.description}
        </CardDescription>
        
        {task.dueDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {formatDate(task.dueDate)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-muted-foreground">
            Created: {formatDate(task.createdAt)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(task.id, getNextStatus(task.status))}
          >
            Mark as {getNextStatus(task.status).replace('-', ' ')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}