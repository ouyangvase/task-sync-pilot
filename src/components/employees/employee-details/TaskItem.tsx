
import { Calendar, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { formatTaskStatusForDisplay, getTaskColor } from "@/lib/taskUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { useState } from "react";
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

interface TaskItemProps {
  task: Task;
  isCompleted?: boolean;
  onTaskUpdate?: () => void;
}

export const TaskItem = ({ task, isCompleted = false, onTaskUpdate }: TaskItemProps) => {
  const { currentUser } = useAuth();
  const { deleteTask } = useTasks();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Only show delete button for admin users
  const isAdmin = currentUser?.role === "admin";

  console.log('TaskItem rendering:', {
    taskId: task.id,
    taskTitle: task.title,
    isAdmin,
    currentUserRole: currentUser?.role
  });

  const handleDelete = async () => {
    console.log('Deleting task:', task.id, task.title);
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      setDeleteDialogOpen(false);
      console.log('Task deleted successfully:', task.id);
      // Trigger immediate refresh
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDeleteMessage = () => {
    if (task.recurrence && task.recurrence !== "once" && !task.isRecurringInstance) {
      return "Are you sure you want to delete this recurring task template? This will also delete all future instances of this task.";
    }
    return "Are you sure you want to delete this task? This action cannot be undone.";
  };

  return (
    <Card key={task.id} className="overflow-hidden">
      <div 
        className="h-2" 
        style={{ backgroundColor: isCompleted ? "#10b981" : getTaskColor(task) }}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            {!isCompleted && (
              <CardDescription className="flex items-center mt-1">
                <Calendar className="h-3 w-3 mr-1" /> Due: {new Date(task.dueDate).toLocaleDateString()}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "Completed"}
                </span>
              </div>
            ) : (
              <Badge variant="outline" className="ml-2">
                {formatTaskStatusForDisplay(task.status)}
              </Badge>
            )}
            {/* Only show delete button for admin users */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-500 hover:text-red-500 hover:bg-red-50"
                title="Delete task (Admin only)"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <p className="line-clamp-2 text-sm">{task.description || "No description"}</p>
          <Badge 
            variant={isCompleted ? "secondary" : "default"}
            className="ml-auto"
          >
            {task.points} pts
          </Badge>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task (Admin Only)</AlertDialogTitle>
            <AlertDialogDescription>
              {getDeleteMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
