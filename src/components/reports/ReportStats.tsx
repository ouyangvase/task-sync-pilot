
import { useTasks } from "@/contexts/TaskContext";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isWithinInterval } from "date-fns";
import { Task } from "@/types";
import { CheckCircle, Clock, Target, Trophy } from "lucide-react";

interface ReportStatsProps {
  dateRange: DateRange;
  filters: {
    employee: string;
    category: string;
    status: string;
  };
}

export function ReportStats({ dateRange, filters }: ReportStatsProps) {
  const { tasks } = useTasks();
  
  // Filter tasks based on date range and other filters
  const filteredTasks = tasks.filter(task => {
    // Date filter
    if (dateRange.from && dateRange.to) {
      const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
      if (!isWithinInterval(taskDate, { start: dateRange.from, end: dateRange.to })) {
        return false;
      }
    }
    
    // Employee filter
    if (filters.employee !== "all" && task.assignee !== filters.employee) {
      return false;
    }
    
    // Category filter
    if (filters.category !== "all" && task.category !== filters.category) {
      return false;
    }
    
    // Status filter
    if (filters.status !== "all" && task.status !== filters.status) {
      return false;
    }
    
    return true;
  });
  
  // Calculate stats
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === "completed").length;
  const totalPoints = filteredTasks.reduce((sum, task) => sum + task.points, 0);
  
  // Calculate average completion time (in hours)
  const completedTasksWithTime = filteredTasks.filter(
    (task): task is Task & { completedAt: string } => 
      task.status === "completed" && !!task.completedAt
  );
  
  let avgCompletionTime = 0;
  if (completedTasksWithTime.length > 0) {
    const totalHours = completedTasksWithTime.reduce((sum, task) => {
      const created = new Date(task.createdAt).getTime();
      const completed = new Date(task.completedAt).getTime();
      return sum + (completed - created) / (1000 * 60 * 60); // Convert ms to hours
    }, 0);
    avgCompletionTime = Math.round((totalHours / completedTasksWithTime.length) * 10) / 10; // Round to 1 decimal
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            Tasks in selected period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedTasks}</div>
          <p className="text-xs text-muted-foreground">
            {totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPoints}</div>
          <p className="text-xs text-muted-foreground">
            Points earned in period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCompletionTime}</div>
          <p className="text-xs text-muted-foreground">
            Hours per task
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
