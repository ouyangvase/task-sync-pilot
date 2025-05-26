
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Task, User } from "@/types";
import { taskFormSchema, TaskFormValues } from "./taskSchema";
import { useTasks } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/auth";
import { Form } from "@/components/ui/form";
import TaskFormBasicFields from "./TaskFormBasicFields";
import TaskFormAssignment from "./TaskFormAssignment";
import TaskFormScheduling from "./TaskFormScheduling";
import TaskFormMetrics from "./TaskFormMetrics";
import TaskFormActions from "./TaskFormActions";
import { Separator } from "@/components/ui/separator";

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

const TaskForm = ({ task, onClose, onTaskUpdate }: TaskFormProps) => {
  const { addTask, updateTask } = useTasks();
  const { users, currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('TaskForm rendered with:', { 
    isEdit: !!task, 
    taskId: task?.id, 
    currentUser: currentUser?.id 
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assignee: "",
      dueDate: new Date().toISOString().split('T')[0],
      priority: "medium",
      category: "custom",
      points: 10,
      recurrence: "once",
    },
  });

  useEffect(() => {
    if (task) {
      // Convert ISO string to datetime-local format for editing
      const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toISOString().slice(0, 16);
      };

      form.reset({
        title: task.title,
        description: task.description || "",
        assignee: task.assignee,
        category: task.category,
        recurrence: task.recurrence,
        dueDate: formatDateTime(task.dueDate),
        priority: task.priority,
        points: task.points,
      });
    }
  }, [task, form]);

  const onSubmit = async (data: TaskFormValues) => {
    console.log('TaskForm submitting:', data);
    setIsSubmitting(true);

    try {
      const taskData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        assignedBy: currentUser?.id,
        status: "pending" as const, // Add the missing status property
      };

      if (task) {
        console.log('Updating existing task:', task.id);
        await updateTask(task.id, taskData);
      } else {
        console.log('Creating new task');
        await addTask(taskData);
      }

      console.log('Task operation successful, triggering refresh');
      
      // Trigger immediate refresh
      if (onTaskUpdate) {
        onTaskUpdate();
      }
      
      onClose();
      
      // Force a small delay to ensure database updates are processed
      setTimeout(() => {
        console.log('Task form closed with delay');
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      }, 100);
      
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log('TaskForm cancelled');
    onClose();
  };

  const filteredUsers = users?.filter((user: User) => user.isApproved !== false) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TaskFormBasicFields />
        
        <Separator />
        
        <TaskFormAssignment />
        
        <Separator />
        
        <TaskFormScheduling />
        
        <Separator />
        
        <TaskFormMetrics />
        
        <TaskFormActions
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          isEditing={!!task}
        />
      </form>
    </Form>
  );
};

export default TaskForm;
