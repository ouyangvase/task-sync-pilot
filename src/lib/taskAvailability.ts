
import { Task } from "@/types";

export const isTaskAvailable = (task: Task): boolean => {
  const now = new Date();
  const taskDueDate = new Date(task.dueDate);
  
  console.log('Checking task availability:', {
    taskTitle: task.title,
    taskDueDate: taskDueDate.toISOString(),
    now: now.toISOString(),
    status: task.status,
    recurrence: task.recurrence
  });
  
  // For completed tasks, they're always "available" (for display purposes)
  if (task.status === "completed") {
    return true;
  }
  
  // For pending and in_progress tasks, make them much more permissive
  // Show all tasks that are due within 30 days or overdue
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
  const daysDifference = Math.ceil((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  console.log('Date comparison:', {
    today: today.toISOString(),
    dueDay: dueDay.toISOString(),
    daysDifference,
    isAvailable: daysDifference <= 30 // Show tasks up to 30 days in advance
  });
  
  // Task is available if due date is within 30 days (past or future)
  return daysDifference <= 30;
};

// New function specifically for action availability (start/complete)
export const isTaskActionable = (task: Task): boolean => {
  const now = new Date();
  const taskDueDate = new Date(task.dueDate);
  
  // For completed tasks, no actions available
  if (task.status === "completed") {
    return false;
  }
  
  // For actions, be more restrictive - only allow within 7 days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
  const daysDifference = Math.ceil((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDifference <= 7;
};

export const isTaskOverdue = (task: Task): boolean => {
  const now = new Date();
  const taskDueDate = new Date(task.dueDate);
  
  // Set both dates to start of day for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
  
  return dueDay < today && task.status !== "completed";
};

export const getTaskAvailabilityStatus = (task: Task): "available" | "upcoming" | "overdue" => {
  if (task.status === "completed") return "available";
  
  const now = new Date();
  const taskDueDate = new Date(task.dueDate);
  
  // Set both dates to start of day for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
  
  if (dueDay < today) return "overdue";
  if (dueDay > today) return "upcoming";
  return "available";
};

export const getDaysUntilDue = (task: Task): number => {
  const now = new Date();
  const taskDueDate = new Date(task.dueDate);
  
  // Set both dates to start of day for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
  
  const diffTime = dueDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
