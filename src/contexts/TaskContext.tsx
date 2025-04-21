
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Task, TaskStats, PointsStats, RewardTier, TaskStatus } from "@/types";
import { mockTasks } from "@/data/mockData";
import { DEFAULT_REWARD_TIERS, DEFAULT_MONTHLY_TARGET } from "@/contexts/task/rewardConstants";

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (taskId: string) => void;
  getUserTasks: (userId: string) => Task[];
  getTasksByCategory: (userId: string, category: string) => Task[];
  getUserTaskStats: (userId: string) => TaskStats;
  getUserPointsStats: (userId: string) => PointsStats;
  rewardTiers: RewardTier[];
  updateRewardTiers: (tiers: RewardTier[]) => void;
  monthlyTarget: number;
  updateMonthlyTarget: (target: number) => void;
  getUserReachedRewards: (userId: string) => RewardTier[];
  getUserMonthlyPoints: (userId: string) => number;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>(DEFAULT_REWARD_TIERS);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(DEFAULT_MONTHLY_TARGET);
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});

  // Load saved data from localStorage if available
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    const savedRewardTiers = localStorage.getItem("rewardTiers");
    if (savedRewardTiers) {
      setRewardTiers(JSON.parse(savedRewardTiers));
    }

    const savedMonthlyTarget = localStorage.getItem("monthlyTarget");
    if (savedMonthlyTarget) {
      setMonthlyTarget(JSON.parse(savedMonthlyTarget));
    }

    const savedUserPoints = localStorage.getItem("userPoints");
    if (savedUserPoints) {
      setUserPoints(JSON.parse(savedUserPoints));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("rewardTiers", JSON.stringify(rewardTiers));
  }, [rewardTiers]);

  useEffect(() => {
    localStorage.setItem("monthlyTarget", JSON.stringify(monthlyTarget));
  }, [monthlyTarget]);

  useEffect(() => {
    localStorage.setItem("userPoints", JSON.stringify(userPoints));
  }, [userPoints]);

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        // If we're updating status to completed, handle completion logic
        if (updates.status === "completed" && task.status !== "completed") {
          const userId = task.assignee;
          const taskPoints = task.points || 0;
          
          // Only award points when status changes to completed
          setUserPoints(prev => ({
            ...prev,
            [userId]: (prev[userId] || 0) + taskPoints
          }));
        }
        
        return { ...task, ...updates };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const completeTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const userId = task.assignee;
        const taskPoints = task.points || 0;
        
        setUserPoints(prev => ({
          ...prev,
          [userId]: (prev[userId] || 0) + taskPoints
        }));
        
        return {
          ...task,
          status: "completed" as TaskStatus,
          completedAt: new Date().toISOString(),
        };
      }
      return task;
    }));
  };

  const getUserTasks = (userId: string): Task[] => {
    return tasks.filter(task => task.assignee === userId);
  };

  const getTasksByCategory = (userId: string, category: string): Task[] => {
    return tasks.filter(
      task => task.assignee === userId && 
      (category === "completed" ? task.status === "completed" : task.category === category)
    );
  };

  const getUserTaskStats = (userId: string): TaskStats => {
    const userTasks = getUserTasks(userId);
    const completed = userTasks.filter(task => task.status === "completed").length;
    const pending = userTasks.filter(task => task.status !== "completed").length;
    const total = userTasks.length;
    const percentComplete = total === 0 ? 0 : Math.round((completed / total) * 100);

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
    const percentComplete = target === 0 ? 0 : Math.round((earned / target) * 100);

    return {
      earned,
      target,
      percentComplete,
    };
  };
  
  const updateRewardTiers = (tiers: RewardTier[]) => {
    setRewardTiers(tiers);
  };

  const updateMonthlyTarget = (target: number) => {
    setMonthlyTarget(target);
  };

  const getUserMonthlyPoints = (userId: string): number => {
    return userPoints[userId] || 0;
  };

  const getUserReachedRewards = (userId: string): RewardTier[] => {
    const points = getUserMonthlyPoints(userId);
    return rewardTiers
      .filter(tier => points >= tier.points)
      .sort((a, b) => a.points - b.points);
  };
  
  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      getUserTasks,
      getTasksByCategory,
      getUserTaskStats,
      getUserPointsStats,
      rewardTiers,
      updateRewardTiers,
      monthlyTarget,
      updateMonthlyTarget,
      getUserReachedRewards,
      getUserMonthlyPoints,
      setTasks,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
