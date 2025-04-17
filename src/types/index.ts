
export type UserRole = "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type TaskCategory = "daily" | "custom" | "completed";
export type TaskRecurrence = "once" | "daily" | "weekly" | "monthly";

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  assignedBy: string;
  category: TaskCategory;
  recurrence: TaskRecurrence;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
}

export interface TaskStats {
  completed: number;
  pending: number;
  total: number;
  percentComplete: number;
}
