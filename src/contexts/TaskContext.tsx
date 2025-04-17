
import React, { createContext, useContext, useState, useEffect } from "react";
import { Task, TaskStats, PointsStats, RewardTier } from "@/types";
import { mockTasks } from "@/data/mockData";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";

// Mock reward tiers
const defaultRewardTiers: RewardTier[] = [
  {
    id: "tier-1",
    points: 300,
    reward: "$50 cash bonus"
  },
  {
    id: "tier-2",
    points: 500,
    reward: "$100 cash bonus"
  },
  {
    id: "tier-3",
    points: 1000,
    reward: "$200 cash bonus + extra day off"
  }
];

// Default monthly target
const DEFAULT_MONTHLY_TARGET = 500;

interface TaskContextType {
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

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>(defaultRewardTiers);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(DEFAULT_MONTHLY_TARGET);
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});
  const { currentUser } = useAuth();

  useEffect(() => {
    // In a real app, this would fetch tasks from an API
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(mockTasks);
      localStorage.setItem("tasks", JSON.stringify(mockTasks));
    }

    // Load saved reward tiers
    const savedRewardTiers = localStorage.getItem("rewardTiers");
    if (savedRewardTiers) {
      setRewardTiers(JSON.parse(savedRewardTiers));
    } else {
      localStorage.setItem("rewardTiers", JSON.stringify(defaultRewardTiers));
    }

    // Load saved monthly target
    const savedMonthlyTarget = localStorage.getItem("monthlyTarget");
    if (savedMonthlyTarget) {
      setMonthlyTarget(JSON.parse(savedMonthlyTarget));
    } else {
      localStorage.setItem("monthlyTarget", JSON.stringify(DEFAULT_MONTHLY_TARGET));
    }

    // Load saved user points
    const savedUserPoints = localStorage.getItem("userPoints");
    if (savedUserPoints) {
      setUserPoints(JSON.parse(savedUserPoints));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Save reward tiers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("rewardTiers", JSON.stringify(rewardTiers));
  }, [rewardTiers]);

  // Save monthly target to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("monthlyTarget", JSON.stringify(monthlyTarget));
  }, [monthlyTarget]);

  // Save user points to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userPoints", JSON.stringify(userPoints));
  }, [userPoints]);

  // Calculate user points 
  const calculateUserPoints = (userId: string): number => {
    const completedTasks = tasks.filter(
      task => task.assignee === userId && task.status === "completed"
    );
    
    // Only count points from tasks completed in the current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyCompletedTasks = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear;
    });

    return monthlyCompletedTasks.reduce((total, task) => total + (task.points || 0), 0);
  };

  const getUserTasks = (userId: string) => {
    return tasks.filter((task) => task.assignee === userId);
  };

  const getTasksByCategory = (userId: string, category: string) => {
    return tasks.filter(
      (task) => task.assignee === userId && 
      (category === "completed" ? task.status === "completed" : task.category === category)
    );
  };

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    if (!currentUser) return;
    
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      assignedBy: currentUser.id,
    };

    setTasks((prev) => [...prev, newTask]);
    toast.success("Task created successfully");
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
    toast.success("Task updated successfully");
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    toast.success("Task deleted successfully");
  };

  const completeTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const completedTask = {
            ...task,
            status: "completed",
            completedAt: new Date().toISOString(),
          };
          
          // Update user points when task is completed
          const userId = task.assignee;
          const taskPoints = task.points || 0;
          
          setUserPoints(prev => ({
            ...prev,
            [userId]: (prev[userId] || 0) + taskPoints
          }));
          
          // Check if user reached milestones for notifications
          const currentPoints = getUserMonthlyPoints(userId);
          const newTotal = currentPoints + taskPoints;
          const percentComplete = (newTotal / monthlyTarget) * 100;
          
          // Show notification at certain thresholds
          if (percentComplete >= 50 && percentComplete < 51) {
            toast.success(`You've reached 50% of your monthly points goal!`);
          } else if (percentComplete >= 80 && percentComplete < 81) {
            toast.success(`You're at 80% of your monthly points goal! Almost there!`);
          } else if (percentComplete >= 100 && percentComplete < 101) {
            toast.success(`Congratulations! You've reached 100% of your monthly points goal!`);
          }
          
          return completedTask;
        }
        return task;
      })
    );
    toast.success("Task completed!");
  };

  const getUserTaskStats = (userId: string): TaskStats => {
    const userTasks = getUserTasks(userId);
    const completed = userTasks.filter((task) => task.status === "completed").length;
    const total = userTasks.length;
    const pending = total - completed;
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      pending,
      total,
      percentComplete,
    };
  };

  const getUserPointsStats = (userId: string): PointsStats => {
    const earned = getUserMonthlyPoints(userId);
    const target = monthlyTarget;
    const percentComplete = target > 0 ? Math.round((earned / target) * 100) : 0;

    return {
      earned,
      target,
      percentComplete,
    };
  };

  const updateRewardTiers = (tiers: RewardTier[]) => {
    setRewardTiers(tiers);
    toast.success("Reward tiers updated successfully");
  };

  const updateMonthlyTarget = (target: number) => {
    setMonthlyTarget(target);
    toast.success("Monthly target updated successfully");
  };

  const getUserReachedRewards = (userId: string): RewardTier[] => {
    const points = getUserMonthlyPoints(userId);
    return rewardTiers
      .filter(tier => points >= tier.points)
      .sort((a, b) => a.points - b.points);
  };

  const getUserMonthlyPoints = (userId: string): number => {
    // In a real app, this would calculate from completed tasks in the current month
    // For now, we'll use our simple userPoints state
    return userPoints[userId] || 0;
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        getUserTasks,
        getTasksByCategory,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        getUserTaskStats,
        getUserPointsStats,
        rewardTiers,
        updateRewardTiers,
        monthlyTarget,
        updateMonthlyTarget,
        getUserReachedRewards,
        getUserMonthlyPoints,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
