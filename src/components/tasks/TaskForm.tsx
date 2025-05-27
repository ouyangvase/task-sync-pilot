
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { Task, TaskStatus } from "@/types";
import { Form } from "@/components/ui/form";
import { taskFormSchema, TaskFormValues, defaultTaskValues } from "./taskSchema";

// Import sub-components
import TaskFormBasicFields from "./TaskFormBasicFields";
import TaskFormAssignment from "./TaskFormAssignment";
import TaskFormScheduling from "./TaskFormScheduling";
import TaskFormMetrics from "./TaskFormMetrics";
import TaskFormActions from "./TaskFormActions";

interface TaskFormProps {
  task?: Task | null;
  onClose?: () => void;
}

const TaskForm = ({ task, onClose }: TaskFormProps) => {
  const { addTask, updateTask } = useTasks();
  const { currentUser } = useAuth();
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultTaskValues,
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

  const onSubmit = (values: TaskFormValues) => {
    // Convert datetime-local format back to ISO string
    const dueDateISO = new Date(values.dueDate).toISOString();

    if (task) {
      updateTask(task.id, {
        ...values,
        dueDate: dueDateISO,
        status: task.status,
      });
    } else {
      // Ensure we have required fields for a new task
      const newTask: Omit<Task, "id" | "createdAt"> = {
        title: values.title,
        description: values.description,
        assignee: values.assignee,
        category: values.category,
        recurrence: values.recurrence,
        dueDate: dueDateISO,
        priority: values.priority,
        points: values.points,
        status: "pending" as TaskStatus,
      };
      
      addTask(newTask);
    }
    
    if (onClose) {
      onClose();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <TaskFormBasicFields />
        <TaskFormAssignment />
        <TaskFormScheduling />
        <TaskFormMetrics />
        <TaskFormActions onCancel={onClose} isEditing={!!task} />
      </form>
    </Form>
  );
};

export default TaskForm;
