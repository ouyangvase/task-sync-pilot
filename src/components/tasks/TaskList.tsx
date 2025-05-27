
import { useState } from "react";
import { Task } from "@/types";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface TaskListProps {
  title: string;
  tasks: Task[];
  emptyMessage?: string;
  showAddButton?: boolean;
  onTaskUpdate?: () => void;
}

const TaskList = ({
  title,
  tasks,
  emptyMessage = "No tasks to display",
  showAddButton = false,
  onTaskUpdate,
}: TaskListProps) => {
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const handleOpenForm = (task?: Task) => {
    if (task) {
      setTaskToEdit(task);
    } else {
      setTaskToEdit(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTaskToEdit(null);
    // Trigger refresh when form closes
    if (onTaskUpdate) {
      onTaskUpdate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        {(showAddButton && isAdmin) && (
          <Button
            size="sm"
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={isAdmin ? handleOpenForm : undefined}
              onTaskUpdate={onTaskUpdate}
            />
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{taskToEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>
          <TaskForm task={taskToEdit} onClose={handleCloseForm} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
