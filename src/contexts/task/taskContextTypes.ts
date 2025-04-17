
import { Task, TaskStats, PointsStats, RewardTier } from "@/types";

export interface TaskContextType {
  tasks: Task[];
  getUserTasks: (userId: string) => Task[];
  getTasksByCategory: (userId: string, category: string) => Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  getUserTaskStats: (userId: string) => TaskStats;
  getUserPointsStats: (userId: string) => PointsStats;
  rewardTiers: RewardTier[];
  updateRewardTiers: (tiers: RewardTier[]) => void;
  monthlyTarget: number;
  updateMonthlyTarget: (target: number) => void;
  getUserReachedRewards: (userId: string) => RewardTier[];
  getUserMonthlyPoints: (userId: string) => number;
}
