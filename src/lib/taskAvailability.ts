
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
  
  // Set both dates to start of day for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
  
  console.log('Date comparison:', {
    today: today.toISOString(),
    dueDay: dueDay.toISOString(),
    isAvailable: dueDay <= today
  });
  
  // Task is available if due date is today or in the past
  return dueDay <= today;
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
