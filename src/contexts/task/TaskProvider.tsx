
import React, { createContext, useContext, useEffect } from "react";
import { Task, TaskStats, PointsStats, RewardTier, TaskStatus } from "@/types";
import { useAuth } from "../AuthContext";
import { toast } from "@/components/ui/sonner";
import { TaskContextType } from "./taskContextTypes";
import { useSupabaseTaskStorage } from "./useSupabaseTaskStorage";
import { useTaskCalculations } from "./useTaskCalculations";
import { supabase } from "@/integrations/supabase/client";
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
  const { 
    tasks, 
    setTasks, 
    rewardTiers, 
    setRewardTiers, 
    monthlyTarget, 
    setMonthlyTarget, 
    userPoints, 
    setUserPoints,
    loading,
    saveTaskToDatabase,
    updateUserPointsInDatabase,
    updateMonthlyTargetInDatabase
  } = useSupabaseTaskStorage();
  
  const { calculateUserPoints } = useTaskCalculations();
  const { currentUser } = useAuth();

  // Generate today's recurring instances on load and periodically
  useEffect(() => {
    const generateTodayInstances = async () => {
      if (!currentUser || loading) return;
      
      const todayInstances = generateTodayRecurringInstances(tasks);
      if (todayInstances.length > 0) {
        const newInstances = todayInstances.map(instance => ({
          ...instance,
          id: `task-${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
        }));

        // Save each instance to database
        for (const instance of newInstances) {
          await saveTaskToDatabase(instance);
        }
        
        console.log(`Generated ${todayInstances.length} recurring task instances for today`);
      }
    };

    if (tasks.length > 0 && !loading) {
      generateTodayInstances();
    }

    // Check for new instances every hour
    const interval = setInterval(generateTodayInstances, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks, loading, currentUser, saveTaskToDatabase]);

  const getUserTasks = (userId: string) => {
    return tasks.filter((task) => task.assignee === userId);
  };

  const getTasksByCategory = (userId: string, category: string) => {
    return tasks.filter(
      (task) => task.assignee === userId && 
      (category === "completed" ? task.status === "completed" : task.category === category)
    );
  };

  const addTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
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

    try {
      await saveTaskToDatabase(newTask);
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = { ...task, ...updates };
      
      // If updating a recurring template, update the next occurrence date
      if (updatedTask.recurrence !== "once" && !updatedTask.isRecurringInstance && updates.dueDate) {
        updatedTask.nextOccurrenceDate = calculateNextOccurrence(updates.dueDate, updatedTask.recurrence);
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          assignee: updatedTask.assignee,
          assigned_by: updatedTask.assignedBy,
          due_date: updatedTask.dueDate,
          status: updatedTask.status,
          priority: updatedTask.priority,
          category: updatedTask.category,
          recurrence: updatedTask.recurrence,
          points: updatedTask.points,
          started_at: updatedTask.startedAt,
          completed_at: updatedTask.completedAt,
          is_recurring_instance: updatedTask.isRecurringInstance,
          parent_task_id: updatedTask.parentTaskId,
          next_occurrence_date: updatedTask.nextOccurrenceDate
        })
        .eq('id', taskId);

      if (error) throw error;
      
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const taskToDelete = tasks.find(task => task.id === taskId);
      
      if (taskToDelete?.recurrence !== "once" && !taskToDelete?.isRecurringInstance) {
        // Deleting a recurring template - also delete all its instances
        const { error } = await supabase
          .from('tasks')
          .delete()
          .or(`id.eq.${taskId},parent_task_id.eq.${taskId}`);
        
        if (error) throw error;
        toast.success("Recurring task template and all instances deleted");
      } else {
        // Deleting a single task or instance
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);
        
        if (error) throw error;
        toast.success("Task deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const startTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !isTaskAvailable(task)) {
      toast.error("This task is not available yet");
      return;
    }

    if (task.status !== "pending") return;

    try {
      await updateTask(taskId, {
        status: "in_progress" as TaskStatus,
        startedAt: new Date().toISOString(),
      });
      toast.success("Task started!");
    } catch (error) {
      console.error("Error starting task:", error);
      toast.error("Failed to start task");
    }
  };

  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !isTaskAvailable(task)) {
      toast.error("This task is not available yet");
      return;
    }

    if (task.status !== "in_progress") return;

    try {
      await updateTask(taskId, {
        status: "completed" as TaskStatus,
        completedAt: new Date().toISOString(),
      });

      // Award points
      const userId = task.assignee;
      const taskPoints = task.points || 0;
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentPoints = userPoints[userId] || 0;
      const newPoints = currentPoints + taskPoints;
      
      await updateUserPointsInDatabase(userId, newPoints);
      
      const percentComplete = (newPoints / monthlyTarget) * 100;
      
      if (percentComplete >= 50 && percentComplete < 51) {
        toast.success(`You've reached 50% of your monthly points goal!`);
      } else if (percentComplete >= 80 && percentComplete < 81) {
        toast.success(`You're at 80% of your monthly points goal! Almost there!`);
      } else if (percentComplete >= 100 && percentComplete < 101) {
        toast.success(`Congratulations! You've reached 100% of your monthly points goal!`);
      } else {
        toast.success("Task completed!");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Failed to complete task");
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

  const updateRewardTiers = async (tiers: RewardTier[]) => {
    try {
      // Delete all existing tiers
      await supabase.from('reward_tiers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new tiers
      const { error } = await supabase
        .from('reward_tiers')
        .insert(tiers.map(tier => ({
          name: tier.name,
          points: tier.points,
          reward: tier.reward,
          description: tier.description
        })));

      if (error) throw error;
      
      toast.success("Reward tiers updated successfully");
    } catch (error) {
      console.error("Error updating reward tiers:", error);
      toast.error("Failed to update reward tiers");
    }
  };

  const updateMonthlyTarget = async (target: number) => {
    try {
      await updateMonthlyTargetInDatabase(target);
      toast.success("Monthly target updated successfully");
    } catch (error) {
      console.error("Error updating monthly target:", error);
      toast.error("Failed to update monthly target");
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading tasks from database...</div>
      </div>
    );
  }

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
