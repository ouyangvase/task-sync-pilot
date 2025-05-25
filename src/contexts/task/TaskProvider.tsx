
import React, { createContext, useContext, useEffect } from "react";
import { Task, TaskStats, PointsStats, RewardTier, TaskStatus } from "@/types";
import { useAuth } from "../AuthContext";
import { toast } from "@/components/ui/sonner";
import { TaskContextType } from "./taskContextTypes";
import { useTaskStorage } from "./useTaskStorage";
import { useTaskCalculations } from "./useTaskCalculations";
import { 
  shouldGenerateNextInstance, 
  createRecurringTaskInstance, 
  calculateNextOccurrence,
  generateTodayRecurringInstances
} from "@/lib/recurringTaskUtils";
import { isTaskAvailable } from "@/lib/taskAvailability";

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

  // Generate today's recurring instances on load and periodically
  useEffect(() => {
    const generateTodayInstances = () => {
      const todayInstances = generateTodayRecurringInstances(tasks);
      if (todayInstances.length > 0) {
        setTasks(prev => [
          ...prev,
          ...todayInstances.map(instance => ({
            ...instance,
            id: `task-${Date.now()}-${Math.random()}`,
            createdAt: new Date().toISOString(),
          }))
        ]);
        console.log(`Generated ${todayInstances.length} recurring task instances for today`);
      }
    };

    if (tasks.length > 0) {
      generateTodayInstances();
    }

    // Check for new instances every hour
    const interval = setInterval(generateTodayInstances, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks, setTasks]);

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
      // For recurring tasks, set the next occurrence date
      nextOccurrenceDate: taskData.recurrence !== "once" 
        ? calculateNextOccurrence(taskData.dueDate, taskData.recurrence)
        : undefined,
    };

    setTasks((prev) => [...prev, newTask]);
    toast.success("Task created successfully");
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates };
          
          // If updating a recurring template, update the next occurrence date
          if (updatedTask.recurrence !== "once" && !updatedTask.isRecurringInstance && updates.dueDate) {
            updatedTask.nextOccurrenceDate = calculateNextOccurrence(updates.dueDate, updatedTask.recurrence);
          }
          
          return updatedTask;
        }
        return task;
      })
    );
    toast.success("Task updated successfully");
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    
    if (taskToDelete?.recurrence !== "once" && !taskToDelete?.isRecurringInstance) {
      // Deleting a recurring template - also delete all its instances
      setTasks((prev) => prev.filter((task) => 
        task.id !== taskId && task.parentTaskId !== taskId
      ));
      toast.success("Recurring task template and all instances deleted");
    } else {
      // Deleting a single task or instance
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully");
    }
  };

  const startTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !isTaskAvailable(task)) {
      toast.error("This task is not available yet");
      return;
    }

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.status === "pending") {
          return {
            ...task,
            status: "in_progress" as TaskStatus,
            startedAt: new Date().toISOString(),
          };
        }
        return task;
      })
    );
    toast.success("Task started!");
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !isTaskAvailable(task)) {
      toast.error("This task is not available yet");
      return;
    }

    setTasks((prev) => {
      const taskToComplete = prev.find(task => task.id === taskId);
      if (!taskToComplete || taskToComplete.status !== "in_progress") {
        return prev;
      }

      const completedTask: Task = {
        ...taskToComplete,
        status: "completed" as TaskStatus,
        completedAt: new Date().toISOString(),
      };

      let newTasks = prev.map((task) => 
        task.id === taskId ? completedTask : task
      );

      // For recurring tasks, we don't generate the next instance immediately
      // It will be generated by the daily check when the time comes

      // Award points
      const userId = taskToComplete.assignee;
      const taskPoints = taskToComplete.points || 0;
      
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

      return newTasks;
    });

    if (!tasks.find(task => task.id === taskId && shouldGenerateNextInstance(task))) {
      toast.success("Task completed!");
    }
  };

  const getUserTaskStats = (userId: string): TaskStats => {
    const userTasks = getUserTasks(userId);
    const completed = userTasks.filter((task) => task.status === "completed").length;
    
    // Only count pending tasks that are available today
    const pendingAvailableToday = userTasks.filter((task) => 
      task.status !== "completed" && isTaskAvailable(task)
    ).length;
    
    const total = userTasks.length;
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      pending: pendingAvailableToday,
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
        startTask,
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
