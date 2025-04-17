
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
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { rolePermissions } from "@/components/employees/employee-details/role-permissions/constants";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  showControls?: boolean;
}

const TaskCard = ({ task, onEdit, showControls = true }: TaskCardProps) => {
  const { completeTask, deleteTask } = useTasks();
  const { currentUser } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!currentUser) return null;
  
  const userRole = currentUser.role || "employee";
  const userPermissions = rolePermissions[userRole] || [];
  
  const isAdmin = userRole === "admin";
  const isManager = userRole === "manager";
  const isTeamLead = userRole === "team_lead";
  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in-progress";
  const isOwnTask = currentUser?.id === task.assignee;
  
  // Check for specific permissions
  const canManageTasks = userPermissions.includes("manage_tasks");
  const canCompleteOwnTasks = userPermissions.includes("complete_tasks");
  
  // Team Lead can only edit tasks assigned to their team
  // In a real app, this would check if the task's assignee is part of the team lead's team
  const isTeamMember = true; // This would be a real check in a production app
  const canManageThisTask = canManageTasks && 
    (!isTeamLead || (isTeamLead && isTeamMember));
  
  const handleComplete = () => {
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
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-slate-100 text-slate-800">Current</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "task-card group border rounded-lg p-4 bg-card",
        isCompleted && "completed border-green-200 bg-green-50/30"
      )}
    >
      <div className="flex items-start gap-3">
        {!isCompleted && showControls && (canCompleteOwnTasks && isOwnTask || canManageThisTask) && (
          <Checkbox 
            checked={isCompleted}
            onCheckedChange={handleComplete}
            className="mt-1"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={cn(
                "font-medium truncate",
                isCompleted && "text-muted-foreground"
              )}>
                {task.title}
              </h3>
              <div className="mt-1">
                {getStatusBadge(task.status)}
              </div>
            </div>
            
            {showControls && ((canManageThisTask) || (isOwnTask && canCompleteOwnTasks && !isCompleted)) && (
              <div className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && canManageThisTask && (
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit task
                      </DropdownMenuItem>
                    )}
                    {canManageThisTask && (
                      <DropdownMenuItem 
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete task
                      </DropdownMenuItem>
                    )}
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
              isCompleted && "text-muted-foreground"
            )}>
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 mt-3">
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
