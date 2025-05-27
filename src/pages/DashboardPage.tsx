import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/task/TaskProvider";
import ProgressCard from "@/components/dashboard/ProgressCard";
import TaskSummaryCard from "@/components/dashboard/TaskSummaryCard";
import TaskList from "@/components/tasks/TaskList";
import PointsProgressCard from "@/components/dashboard/PointsProgressCard";
import RewardsManager from "@/components/rewards/RewardsManager";
import AchievementsSection from "@/components/dashboard/AchievementsSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";
import { isTaskAvailable } from "@/lib/taskAvailability";
import { useScreenSize } from "@/hooks/use-mobile";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { cn } from "@/lib/utils";

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
  const { isMobile, isTablet } = useScreenSize();
  
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
    <div className="space-y-6 sm:space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowRewardsSettings(prev => !prev)}
              className="flex items-center gap-1 px-3 py-2 text-sm rounded-md bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors touch-manipulation min-h-[44px]"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">
                {showRewardsSettings ? "Hide Rewards Settings" : "Manage Rewards"}
              </span>
              <span className="sm:hidden">Rewards</span>
            </button>
          </div>
        )}
      </div>
      
      {isAdmin && showRewardsSettings && (
        <ResponsiveContainer variant="section" className="mb-6 sm:mb-8">
          <RewardsManager />
        </ResponsiveContainer>
      )}
      
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
      )}>
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
      
      <div className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
      )}>
        <ProgressCard stats={taskStats} />
        <PointsProgressCard 
          stats={pointsStats} 
          rewards={reachedRewards.length ? reachedRewards : rewardTiers.slice(0, 1)}
        />
      </div>

      <AchievementsSection />
      
      <div className="grid gap-6 sm:gap-8">
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
