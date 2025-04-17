
import { TaskStatus } from "@/types";

// Get color for task status
export const getTaskStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case "pending":
      return "#8E9196"; // Grey
    case "in-progress":
      return "#2563eb"; // Blue
    case "completed":
      return "#16a34a"; // Green
    default:
      return "#8E9196"; // Default grey
  }
};

// Function to determine if a task is overdue
export const isTaskOverdue = (dueDate: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(dueDate);
  return taskDate < today;
};

// Get color for task, including overdue status
export const getTaskColor = (task: { status: TaskStatus; dueDate: string }): string => {
  if (task.status !== "completed" && isTaskOverdue(task.dueDate)) {
    return "#ea384c"; // Red for overdue
  }
  return getTaskStatusColor(task.status);
};
