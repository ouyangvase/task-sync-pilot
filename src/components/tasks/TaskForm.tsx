
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { Task, TaskStatus, User } from "@/types";
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
  preselectedAssignee?: User; // Added the preselectedAssignee prop
}

const TaskForm = ({ task, onClose, preselectedAssignee }: TaskFormProps) => {
  const { addTask, updateTask } = useTasks();
  const { currentUser } = useAuth();
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      ...defaultTaskValues,
      // Use preselectedAssignee if provided
      assignee: preselectedAssignee ? preselectedAssignee.id : defaultTaskValues.assignee
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        assignee: task.assignee,
        category: task.category as "daily" | "custom",
        recurrence: task.recurrence,
        dueDate: task.dueDate,
        priority: task.priority,
        points: task.points,
      });
    } else if (preselectedAssignee) {
      // If preselectedAssignee is provided but no task, just set the assignee field
      form.setValue("assignee", preselectedAssignee.id);
    }
  }, [task, form, preselectedAssignee]);

  const onSubmit = (values: TaskFormValues) => {
    if (task) {
      updateTask(task.id, {
        ...values,
        status: task.status,
      });
    } else {
      // Ensure we have required fields for a new task
      // Since values from the form match the schema requirements,
      // we can safely assert that they meet our Task type requirements
      const newTask: Omit<Task, "id" | "createdAt"> = {
        title: values.title,
        description: values.description,
        assignee: values.assignee,
        category: values.category,
        recurrence: values.recurrence,
        dueDate: values.dueDate,
        priority: values.priority,
        points: values.points,
        status: "pending" as TaskStatus,
        assignedBy: currentUser?.id || "",
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
