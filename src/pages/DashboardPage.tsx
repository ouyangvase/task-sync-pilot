
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import ProgressCard from "@/components/dashboard/ProgressCard";
import TaskSummaryCard from "@/components/dashboard/TaskSummaryCard";
import TaskList from "@/components/tasks/TaskList";
import PointsProgressCard from "@/components/dashboard/PointsProgressCard";
import RewardsManager from "@/components/rewards/RewardsManager";
import AchievementsSection from "@/components/dashboard/AchievementsSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";
import { isTaskAvailable } from "@/lib/taskAvailability";

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { 
    getUserTasks, 
    getTasksByCategory, 
    getUserTaskStats, 
    getUserPointsStats,
    getUserReachedRewards,
    rewardTiers
  } = useTasks();
  const [showRewardsSettings, setShowRewardsSettings] = useState(false);
  
  useEffect(() => {
    document.title = "Dashboard | TaskSync Pilot";
  }, []);
  
  if (!currentUser) {
    return null;
  }
  
  const isAdmin = currentUser.role === "admin";
  const dailyTasks = getTasksByCategory(currentUser.id, "daily");
  const customTasks = getTasksByCategory(currentUser.id, "custom");
  const completedTasks = getTasksByCategory(currentUser.id, "completed");
  const allTasks = getUserTasks(currentUser.id);
  const taskStats = getUserTaskStats(currentUser.id);
  const pointsStats = getUserPointsStats(currentUser.id);
  const reachedRewards = getUserReachedRewards(currentUser.id);
  
  // Get counts for summary cards - only count tasks available today as pending
  const pendingCount = allTasks.filter((task) => 
    task.status !== "completed" && isTaskAvailable(task)
  ).length;
  const completedCount = allTasks.filter((task) => task.status === "completed").length;
  
  // Count overdue tasks (tasks that are past due and not completed)
  const overdueCount = allTasks.filter((task) => 
    task.status !== "completed" && 
    new Date(task.dueDate) < new Date() &&
    isTaskAvailable(task)
  ).length;
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowRewardsSettings(prev => !prev)}
              className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
            >
              <Trophy className="h-4 w-4" />
              {showRewardsSettings ? "Hide Rewards Settings" : "Manage Rewards"}
            </button>
          </div>
        )}
      </div>
      
      {isAdmin && showRewardsSettings && (
        <div className="mb-8">
          <RewardsManager />
        </div>
      )}
      
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
      
      <div className="grid gap-6 md:grid-cols-2">
        <ProgressCard stats={taskStats} />
        <PointsProgressCard 
          stats={pointsStats} 
          rewards={reachedRewards.length ? reachedRewards : rewardTiers.slice(0, 1)}
        />
      </div>

      {/* Add Achievements Section */}
      <AchievementsSection />
      
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
