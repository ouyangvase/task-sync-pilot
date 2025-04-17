
import { Task } from "@/types";

export function useTaskCalculations() {
  const calculateUserPoints = (userId: string, tasks: Task[]): number => {
    const completedTasks = tasks.filter(
      task => task.assignee === userId && task.status === "completed"
    );
    
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

  return { calculateUserPoints };
}
