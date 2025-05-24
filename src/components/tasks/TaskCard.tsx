
import { useState } from "react";
import { Task } from "@/types";
import { useTasks } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Edit, Trash2, Play, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { startTask, completeTask, deleteTask } = useTasks();
  const { currentUser } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isAdmin = currentUser?.role === "admin";
  const isCompleted = task.status === "completed";
  const isPending = task.status === "pending";
  const isInProgress = task.status === "in_progress";
  
  const handleStartTask = () => {
    startTask(task.id);
  };
  
  const handleCompleteTask = () => {
    completeTask(task.id);
  };
  
  const handleDelete = () => {
    deleteTask(task.id);
    setDeleteDialogOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const getRecurrenceText = (recurrence: string) => {
    switch (recurrence) {
      case "once":
        return "One-time";
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return recurrence;
    }
  };

  return (
    <div 
      className={cn(
        "task-card group",
        isCompleted && "completed"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              "font-medium truncate",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            
            {(isAdmin || currentUser?.id === task.assignee) && (
              <div className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit task
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this task? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          
          {task.description && (
            <p className={cn(
              "text-sm text-muted-foreground mt-1",
              isCompleted && "line-through"
            )}>
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {getStatusText(task.status)}
            </Badge>
            
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            
            <Badge variant="outline">
              {getRecurrenceText(task.recurrence)}
            </Badge>

            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              {task.points} pts
            </Badge>
            
            <Badge variant="outline" className="ml-auto">
              Due: {format(new Date(task.dueDate), "MMM d")}
            </Badge>
          </div>
          
          {/* Task Action Buttons */}
          <div className="flex gap-2 mt-3">
            {isPending && currentUser?.id === task.assignee && (
              <Button
                size="sm"
                onClick={handleStartTask}
                className="flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                Take Job
              </Button>
            )}
            
            {isInProgress && currentUser?.id === task.assignee && (
              <Button
                size="sm"
                onClick={handleCompleteTask}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-3 w-3" />
                Mark Complete
              </Button>
            )}
          </div>
          
          {isCompleted && task.completedAt && (
            <div className="text-xs text-muted-foreground mt-2">
              Completed on {format(new Date(task.completedAt), "MMM d, yyyy 'at' h:mm a")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
