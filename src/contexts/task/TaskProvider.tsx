import React, { createContext, useContext, useEffect } from "react";
import { Task, TaskStats, PointsStats, RewardTier, TaskStatus } from "@/types";
import { useAuth } from "../AuthContext";
import { toast } from "@/components/ui/sonner";
import { TaskContextType } from "./taskContextTypes";
import { useSupabaseTaskStorage } from "./useSupabaseTaskStorage";
import { useTaskCalculations } from "./useTaskCalculations";
import { supabase } from "@/integrations/supabase/client";
import { isTaskActionable } from "@/lib/taskAvailability";
import { updateTaskInDatabase } from "./database/taskOperations";

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
    updateMonthlyTargetInDatabase,
    forceRefresh
  } = useSupabaseTaskStorage();
  
  const { calculateUserPoints } = useTaskCalculations();
  const { currentUser, loading: authLoading } = useAuth();

  // Show loading only when auth is loading or when we're loading data for authenticated users
  if (authLoading || (currentUser && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">
          {authLoading ? "Checking authentication..." : "Loading tasks from database..."}
        </div>
      </div>
    );
  }

  // If user is not authenticated, render children (which should handle redirect to login)
  if (!currentUser) {
    return (
      <TaskContext.Provider
        value={{
          tasks: [],
          getUserTasks: () => [],
          getTasksByCategory: () => [],
          addTask: async () => {},
          updateTask: async () => {},
          deleteTask: async () => {},
          startTask: async () => {},
          completeTask: async () => {},
          getUserTaskStats: () => ({ completed: 0, pending: 0, total: 0, percentComplete: 0 }),
          getUserPointsStats: () => ({ earned: 0, target: 500, percentComplete: 0 }),
          rewardTiers: [],
          updateRewardTiers: async () => {},
          monthlyTarget: 500,
          updateMonthlyTarget: async () => {},
          getUserReachedRewards: () => [],
          getUserMonthlyPoints: () => 0,
        }}
      >
        {children}
      </TaskContext.Provider>
    );
  }

  const getUserTasks = (userId: string) => {
    console.log('Getting tasks for user:', userId);
    console.log('All tasks count:', tasks.length);
    
    let userTasks;
    
    if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
      userTasks = tasks.filter((task) => task.assignee === userId);
      console.log('Admin/Manager viewing tasks for user:', userId, 'Found:', userTasks.length);
    } else {
      userTasks = tasks.filter((task) => task.assignee === userId && task.assignee === currentUser.id);
      console.log('Regular user viewing own tasks. User ID:', currentUser.id, 'Found:', userTasks.length);
    }
    
    return userTasks;
  };

  const getTasksByCategory = (userId: string, category: string) => {
    const userTasks = getUserTasks(userId);
    return userTasks.filter(
      (task) => category === "completed" ? task.status === "completed" : task.category === category
    );
  };

  const addTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (!currentUser) return;
    
    console.log('Adding new task:', taskData);
    
    const newTaskData = {
      ...taskData,
      assignedBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    try {
      console.log('Calling saveTaskToDatabase with:', newTaskData);
      const savedTask = await saveTaskToDatabase(newTaskData);
      
      console.log('Task creation successful, saved task:', savedTask);
      toast.success("Task created successfully");
      forceRefresh(); // Force immediate UI update
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task. Please try again.");
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    console.log('Updating task:', taskId, updates);
    
    try {
      // Use the new dedicated update function
      await updateTaskInDatabase(taskId, updates);
      
      console.log('Task updated successfully');
      toast.success("Task updated successfully");
      forceRefresh(); // Force immediate UI update
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task. Please try again.");
    }
  };

  const deleteTask = async (taskId: string) => {
    console.log('Deleting task:', taskId);
    
    if (currentUser?.role !== 'admin') {
      toast.error("Only administrators can delete tasks");
      return;
    }
    
    try {
      const taskToDelete = tasks.find(task => task.id === taskId);
      
      if (taskToDelete?.recurrence !== "once" && !taskToDelete?.isRecurringInstance) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .or(`id.eq.${taskId},parent_task_id.eq.${taskId}`);
        
        if (error) {
          console.error('Database error deleting recurring task:', error);
          throw error;
        }
        toast.success("Recurring task template and all instances deleted");
      } else {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);
        
        if (error) {
          console.error('Database error deleting task:', error);
          throw error;
        }
        toast.success("Task deleted successfully");
      }
      
      console.log('Task deleted successfully');
      forceRefresh(); // Force immediate UI update
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  const startTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !isTaskActionable(task)) {
      toast.error("This task is not available yet");
      return;
    }

    if (task.status !== "pending") return;

    try {
      // Optimistic update for immediate UI feedback
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, status: "in_progress" as TaskStatus, startedAt: new Date().toISOString() }
            : t
        )
      );

      await updateTask(taskId, {
        status: "in_progress" as TaskStatus,
        startedAt: new Date().toISOString(),
      });
      
      toast.success("Task started!");
    } catch (error) {
      // Revert optimistic update on error
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, status: "pending" as TaskStatus, startedAt: undefined }
            : t
        )
      );
      console.error("Error starting task:", error);
      toast.error("Failed to start task");
    }
  };

  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !isTaskActionable(task)) {
      toast.error("This task is not available yet");
      return;
    }

    if (task.status !== "in_progress") return;

    try {
      const completedAt = new Date().toISOString();
      
      // Optimistic update for immediate UI feedback
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, status: "completed" as TaskStatus, completedAt }
            : t
        )
      );

      await updateTask(taskId, {
        status: "completed" as TaskStatus,
        completedAt,
      });

      // Award points
      const userId = task.assignee;
      const taskPoints = task.points || 0;
      
      const currentPoints = userPoints[userId] || 0;
      const newPoints = currentPoints + taskPoints;
      
      // Optimistic update for points
      setUserPoints(prev => ({ ...prev, [userId]: newPoints }));
      
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
      // Revert optimistic updates on error
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, status: "in_progress" as TaskStatus, completedAt: undefined }
            : t
        )
      );
      const currentPoints = userPoints[task.assignee] || 0;
      const revertedPoints = Math.max(0, currentPoints - (task.points || 0));
      setUserPoints(prev => ({ ...prev, [task.assignee]: revertedPoints }));
      
      console.error("Error completing task:", error);
      toast.error("Failed to complete task");
    }
  };

  const getUserTaskStats = (userId: string): TaskStats => {
    const userTasks = getUserTasks(userId);
    const completed = userTasks.filter((task) => task.status === "completed").length;
    const pending = userTasks.filter((task) => task.status !== "completed").length;
    const total = userTasks.length;
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

  const updateRewardTiers = async (tiers: RewardTier[]) => {
    try {
      await supabase.from('reward_tiers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
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
      forceRefresh();
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
