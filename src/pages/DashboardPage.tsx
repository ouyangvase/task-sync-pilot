
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import ProgressCard from "@/components/dashboard/ProgressCard";
import TaskSummaryCard from "@/components/dashboard/TaskSummaryCard";
import TaskList from "@/components/tasks/TaskList";

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { getUserTasks, getTasksByCategory, getUserTaskStats } = useTasks();
  
  useEffect(() => {
    document.title = "Dashboard | TaskSync Pilot";
  }, []);
  
  if (!currentUser) {
    return null;
  }
  
  const dailyTasks = getTasksByCategory(currentUser.id, "daily");
  const customTasks = getTasksByCategory(currentUser.id, "custom");
  const completedTasks = getTasksByCategory(currentUser.id, "completed");
  const allTasks = getUserTasks(currentUser.id);
  const taskStats = getUserTaskStats(currentUser.id);
  
  // Get counts for summary cards
  const pendingCount = allTasks.filter((task) => task.status === "pending").length;
  const completedCount = allTasks.filter((task) => task.status === "completed").length;
  
  // Mock overdue count (in a real app, would be based on due dates that have passed)
  const overdueCount = allTasks.filter((task) => 
    task.status !== "completed" && 
    new Date(task.dueDate) < new Date()
  ).length;
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <TaskSummaryCard
          title="Tasks Completed"
          count={completedCount}
          type="completed"
        />
        <TaskSummaryCard
          title="Tasks Pending"
          count={pendingCount}
          type="pending"
        />
        <TaskSummaryCard
          title="Tasks Overdue"
          count={overdueCount}
          type="overdue"
        />
      </div>
      
      <ProgressCard stats={taskStats} />
      
      <div className="grid gap-8">
        <TaskList
          title="Daily Fixed Tasks"
          tasks={dailyTasks.filter(task => task.status !== "completed")}
          emptyMessage="No daily tasks assigned"
          showAddButton={false}
        />
        
        <TaskList
          title="Custom Tasks"
          tasks={customTasks.filter(task => task.status !== "completed")}
          emptyMessage="No custom tasks assigned"
          showAddButton={true}
        />
        
        {completedTasks.length > 0 && (
          <TaskList
            title="Recently Completed"
            tasks={completedTasks.slice(0, 5)}
            emptyMessage="No completed tasks"
            showAddButton={false}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
