
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import TaskList from "@/components/tasks/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TasksPage = () => {
  const { currentUser } = useAuth();
  const { getUserTasks, getTasksByCategory } = useTasks();
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    document.title = "Tasks | TaskSync Pilot";
  }, []);
  
  if (!currentUser) {
    return null;
  }
  
  const allTasks = getUserTasks(currentUser.id);
  const dailyTasks = getTasksByCategory(currentUser.id, "daily");
  const customTasks = getTasksByCategory(currentUser.id, "custom");
  const completedTasks = getTasksByCategory(currentUser.id, "completed");
  
  const pendingDailyTasks = dailyTasks.filter(task => task.status !== "completed");
  const pendingCustomTasks = customTasks.filter(task => task.status !== "completed");
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="daily">Daily Fixed</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <TaskList
            title="All Tasks"
            tasks={allTasks.filter(task => task.status !== "completed")}
            emptyMessage="No tasks assigned yet"
            showAddButton={true}
          />
        </TabsContent>
        
        <TabsContent value="daily">
          <TaskList
            title="Daily Fixed Tasks"
            tasks={pendingDailyTasks}
            emptyMessage="No daily tasks assigned yet"
            showAddButton={true}
          />
        </TabsContent>
        
        <TabsContent value="custom">
          <TaskList
            title="Custom Tasks"
            tasks={pendingCustomTasks}
            emptyMessage="No custom tasks assigned yet"
            showAddButton={true}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <TaskList
            title="Completed Tasks"
            tasks={completedTasks}
            emptyMessage="No completed tasks yet"
            showAddButton={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TasksPage;
