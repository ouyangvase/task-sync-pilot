
import { useState } from "react";
import { Task } from "@/types";
import { useTasks } from "@/contexts/task/TaskProvider";
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
import { MoreVertical, Edit, Trash2, Play, CheckCircle, Repeat, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { isTaskAvailable, getTaskAvailabilityStatus, getDaysUntilDue } from "@/lib/taskAvailability";
import { useScreenSize } from "@/hooks/use-mobile";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { startTask, completeTask, deleteTask } = useTasks();
  const { currentUser } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { isMobile } = useScreenSize();
  
  const isAdmin = currentUser?.role === "admin";
  const isCompleted = task.status === "completed";
  const isPending = task.status === "pending";
  const isInProgress = task.status === "in_progress";
  const isRecurring = task.recurrence !== "once";
  const isAvailable = isTaskAvailable(task);
  const availabilityStatus = getTaskAvailabilityStatus(task);
  
  const handleStartTask = () => {
    if (!isAvailable) return;
    startTask(task.id);
  };
  
  const handleCompleteTask = () => {
    if (!isAvailable) return;
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

  const getDeleteMessage = () => {
    if (isRecurring && !task.isRecurringInstance) {
      return "Are you sure you want to delete this recurring task template? This will also delete all future instances of this task.";
    }
    return "Are you sure you want to delete this task? This action cannot be undone.";
  };

  const getAvailabilityBadge = () => {
    if (isCompleted) return null;
    
    switch (availabilityStatus) {
      case "overdue":
        return (
          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
            Overdue
          </Badge>
        );
      case "upcoming":
        const daysUntil = getDaysUntilDue(task);
        return (
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            {daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "task-card group",
        isCompleted && "completed",
        !isAvailable && !isCompleted && "opacity-75",
        "touch-manipulation" // Improve touch responsiveness
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className={cn(
                "font-medium text-sm sm:text-base",
                isMobile ? "leading-5" : "truncate",
                isCompleted && "line-through text-muted-foreground",
                !isAvailable && !isCompleted && "text-muted-foreground"
              )}>
                {task.title}
              </h3>
              {isRecurring && (
                <Repeat className="h-4 w-4 text-blue-500 shrink-0" />
              )}
              {task.isRecurringInstance && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 shrink-0">
                  Instance
                </Badge>
              )}
            </div>
            
            {/* Only show menu if user is admin or if it's an edit-enabled task */}
            {(isAdmin || (onEdit && currentUser?.id === task.assignee)) && (
              <div className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-8 w-8 touch-manipulation min-h-[44px] min-w-[44px]",
                        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    {onEdit && (isAdmin || currentUser?.id === task.assignee) && (
                      <DropdownMenuItem onClick={() => onEdit(task)} className="min-h-[44px]">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit task
                      </DropdownMenuItem>
                    )}
                    {/* Only show delete option for admin users */}
                    {isAdmin && (
                      <DropdownMenuItem 
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-red-500 focus:text-red-500 min-h-[44px]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete task
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent className="mx-4 max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        {getDeleteMessage()}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 min-h-[44px]"
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
              isMobile ? "leading-5" : "",
              isCompleted && "line-through",
              !isAvailable && !isCompleted && "text-muted-foreground"
            )}>
              {task.description}
            </p>
          )}
          
          <div className={cn(
            "flex flex-wrap items-center gap-2 mt-3",
            isMobile && "gap-1.5"
          )}>
            <Badge variant="outline" className={cn(getStatusColor(task.status), "text-xs")}>
              {getStatusText(task.status)}
            </Badge>
            
            <Badge variant="outline" className={cn(getPriorityColor(task.priority), "text-xs")}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            
            <Badge variant="outline" className={cn(
              isRecurring ? "bg-blue-100 text-blue-800 border-blue-200" : "",
              "text-xs"
            )}>
              {getRecurrenceText(task.recurrence)}
            </Badge>

            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
              {task.points} pts
            </Badge>
            
            {getAvailabilityBadge()}
            
            <Badge variant="outline" className={cn("text-xs", isMobile ? "w-full mt-1" : "ml-auto")}>
              Due: {format(new Date(task.dueDate), isMobile ? "MMM d, h:mm a" : "MMM d, h:mm a")}
            </Badge>
          </div>
          
          {/* Task Action Buttons */}
          <div className={cn(
            "flex gap-2 mt-3",
            isMobile && "flex-col"
          )}>
            {isPending && currentUser?.id === task.assignee && (
              <Button
                size={isMobile ? "default" : "sm"}
                onClick={handleStartTask}
                disabled={!isAvailable}
                className={cn(
                  "flex items-center gap-1 touch-manipulation min-h-[44px]",
                  !isAvailable && "opacity-50 cursor-not-allowed",
                  isMobile && "w-full justify-center"
                )}
              >
                <Play className="h-3 w-3" />
                {isAvailable ? "Take Job" : "Not Available Yet"}
              </Button>
            )}
            
            {isInProgress && currentUser?.id === task.assignee && (
              <Button
                size={isMobile ? "default" : "sm"}
                onClick={handleCompleteTask}
                disabled={!isAvailable}
                className={cn(
                  "flex items-center gap-1 bg-green-600 hover:bg-green-700 touch-manipulation min-h-[44px]",
                  !isAvailable && "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400",
                  isMobile && "w-full justify-center"
                )}
              >
                <CheckCircle className="h-3 w-3" />
                {isAvailable ? "Mark Complete" : "Not Available Yet"}
              </Button>
            )}
          </div>
          
          {isCompleted && task.completedAt && (
            <div className="text-xs text-muted-foreground mt-2">
              Completed on {format(new Date(task.completedAt), "MMM d, yyyy 'at' h:mm a")}
              {isRecurring && (
                <span className="ml-2 text-blue-600">
                  • Next occurrence scheduled
                </span>
              )}
            </div>
          )}
          
          {task.nextOccurrenceDate && !isCompleted && isRecurring && (
            <div className="text-xs text-blue-600 mt-2">
              Next occurrence: {format(new Date(task.nextOccurrenceDate), "MMM d, yyyy 'at' h:mm a")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
