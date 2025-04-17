export type UserRole = "admin" | "employee" | "tenant" | "landlord" | "merchant";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  avatar?: string;
  monthlyPoints?: number;
  department?: string;
}

export type TaskCategory = "daily" | "custom" | "completed";
export type TaskRecurrence = "once" | "daily" | "weekly" | "monthly";
export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

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
  priority: TaskPriority;
  status: TaskStatus;
  points: number;
}

export interface TaskStats {
  completed: number;
  pending: number;
  total: number;
  percentComplete: number;
}

export interface PointsStats {
  earned: number;
  target: number;
  percentComplete: number;
}

export interface RewardTier {
  id: string;
  points: number;
  reward: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  department?: string;
  avatar_url?: string;
}

export interface AuthSession {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}
