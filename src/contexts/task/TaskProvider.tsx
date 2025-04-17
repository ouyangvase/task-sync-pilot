
import React, { createContext, useContext } from "react";
import { Task, TaskStats, PointsStats, RewardTier, TaskStatus } from "@/types";
import { useAuth } from "../AuthContext";
import { toast } from "@/components/ui/sonner";
import { TaskContextType } from "./taskContextTypes";
import { useTaskStorage } from "./useTaskStorage";
import { useTaskCalculations } from "./useTaskCalculations";

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tasks, setTasks, rewardTiers, setRewardTiers, monthlyTarget, setMonthlyTarget, userPoints, setUserPoints } = useTaskStorage();
  const { calculateUserPoints } = useTaskCalculations();
  const { currentUser } = useAuth();

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
    };

    setTasks((prev) => [...prev, newTask]);
    toast.success("Task created successfully");
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      return prev.map((task) => {
        if (task.id === taskId) {
          // If we're updating status to completed, handle completion logic
          if (updates.status === "completed" && task.status !== "completed") {
            const completedTask: Task = {
              ...task,
              ...updates,
              status: "completed",
              completedAt: new Date().toISOString(),
            };
            
            const userId = task.assignee;
            const taskPoints = task.points || 0;
            
            // Only award points when status changes to completed
            setUserPoints(prev => ({
              ...prev,
              [userId]: (prev[userId] || 0) + taskPoints
            }));
            
            const currentPoints = getUserMonthlyPoints(userId);
            const newTotal = currentPoints + taskPoints;
            const percentComplete = (newTotal / monthlyTarget) * 100;
            
            if (percentComplete >= 50 && percentComplete < 51) {
              toast.success(`You've reached 50% of your monthly points goal!`);
            } else if (percentComplete >= 80 && percentComplete < 81) {
              toast.success(`You're at 80% of your monthly points goal! Almost there!`);
            } else if (percentComplete >= 100 && percentComplete < 101) {
              toast.success(`Congratulations! You've reached 100% of your monthly points goal!`);
            }
            
            return completedTask;
          }
          
          // For all other updates, just apply the changes
          return { ...task, ...updates };
        }
        return task;
      });
    });
    
    // Show appropriate toast message based on updates
    if (updates.status === "completed") {
      toast.success("Task completed! Points awarded.");
    } else if (updates.status === "in-progress") {
      toast.success("Task marked as in progress");
    } else {
      toast.success("Task updated successfully");
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    toast.success("Task deleted successfully");
  };

  const completeTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const completedTask: Task = {
            ...task,
            status: "completed" as TaskStatus,
            completedAt: new Date().toISOString(),
          };
          
          const userId = task.assignee;
          const taskPoints = task.points || 0;
          
          setUserPoints(prev => ({
            ...prev,
            [userId]: (prev[userId] || 0) + taskPoints
          }));
          
          const currentPoints = getUserMonthlyPoints(userId);
          const newTotal = currentPoints + taskPoints;
          const percentComplete = (newTotal / monthlyTarget) * 100;
          
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
    toast.success("Task completed! Points awarded.");
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
        setTasks, // Expose setTasks so it can be used for bulk operations
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
