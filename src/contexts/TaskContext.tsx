import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Task, TaskStats, PointsStats } from "@/types";
import { mockTasks } from "@/data/mockData";

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getUserTasks: (userId: string) => Task[];
  getUserTaskStats: (userId: string) => TaskStats;
  getUserPointsStats: (userId: string) => PointsStats;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  useEffect(() => {
    // Simulate fetching tasks from a database or API
    // In a real application, you would fetch tasks from a backend
    // and update the state accordingly.
    // For now, we're using mock data.
  }, [currentUser]);

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getUserTasks = (userId: string): Task[] => {
    return tasks.filter(task => task.assignee === userId);
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
    const userTasks = getUserTasks(userId);
    const earned = userTasks.filter(task => task.status === "completed").reduce((acc, task) => acc + task.points, 0);
    const target = 100; // Example target points
    const percentComplete = target === 0 ? 0 : Math.round((earned / target) * 100);

    return {
      earned,
      target,
      percentComplete,
    };
  };
  
  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      getUserTasks,
      getUserTaskStats,
      getUserPointsStats,
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
