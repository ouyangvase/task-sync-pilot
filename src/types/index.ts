
export type UserRole = "admin" | "employee" | "team_lead" | "manager";

export interface UserPermission {
  targetUserId: string;
  canView: boolean;
  canEdit: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  monthlyPoints?: number;
  title?: string; // Added title property for employee titles
  permissions?: UserPermission[]; // Cross-user permissions
  isApproved?: boolean; // Added for registration approval workflow
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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  pointsRequired: number;
  isUnlocked?: boolean;
  unlockedDate?: string;
  currentPoints?: number;
}
