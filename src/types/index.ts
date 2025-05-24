
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title?: string;
  avatar?: string;
  isApproved?: boolean;
  permissions?: UserPermission[];
  monthlyPoints?: number;
}

export interface UserPermission {
  targetUserId: string;
  canView: boolean;
  canEdit: boolean;
}

export type UserRole = "admin" | "manager" | "team_lead" | "employee";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assignedBy?: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  recurrence: TaskRecurrence;
  points: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskCategory = "daily" | "custom";
export type TaskRecurrence = "once" | "daily" | "weekly" | "monthly";

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
  name: string;
  points: number;
  reward: string;
  description?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "task" | "points" | "streak" | "special";
  criteria: {
    type: "task_count" | "points_earned" | "streak_days" | "custom";
    value: number;
    timeframe?: "daily" | "weekly" | "monthly" | "all_time";
  };
  reward?: string;
  isUnlocked?: boolean;
  unlockedAt?: string;
  unlockedDate?: string;
  progress?: number;
  currentPoints?: number;
  pointsRequired?: number;
}
