
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
  const followUpTasks = getTasksByCategory(currentUser.id, "follow_up");
  const newSalesTasks = getTasksByCategory(currentUser.id, "new_sales");
  const adminTasks = getTasksByCategory(currentUser.id, "admin");
  const contentTasks = getTasksByCategory(currentUser.id, "content");
  const customerServiceTasks = getTasksByCategory(currentUser.id, "customer_service");
  const customTasks = getTasksByCategory(currentUser.id, "custom");
  const completedTasks = getTasksByCategory(currentUser.id, "completed");
  
  const pendingTasks = allTasks.filter(task => task.status !== "completed");
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="follow_up">Follow Up</TabsTrigger>
          <TabsTrigger value="new_sales">Sales</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="customer_service">Support</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <TaskList
            title="All Pending Tasks"
            tasks={pendingTasks}
            emptyMessage="No pending tasks"
            showAddButton={true}
          />
        </TabsContent>
        
        <TabsContent value="follow_up">
          <TaskList
            title="Follow Up Tasks"
            tasks={followUpTasks.filter(task => task.status !== "completed")}
            emptyMessage="No follow up tasks"
            showAddButton={true}
          />
        </TabsContent>
        
        <TabsContent value="new_sales">
          <TaskList
            title="New Sales Tasks"
            tasks={newSalesTasks.filter(task => task.status !== "completed")}
            emptyMessage="No sales tasks"
            showAddButton={true}
          />
        </TabsContent>
        
        <TabsContent value="admin">
          <TaskList
            title="Admin Tasks"
            tasks={adminTasks.filter(task => task.status !== "completed")}
            emptyMessage="No admin tasks"
            showAddButton={true}
          />
        </TabsContent>
        
        <TabsContent value="content">
          <TaskList
            title="Content Tasks"
            tasks={contentTasks.filter(task => task.status !== "completed")}
            emptyMessage="No content tasks"
            showAddButton={true}
          />
        </TabsContent>
        
        <TabsContent value="customer_service">
          <TaskList
            title="Customer Service Tasks"
            tasks={customerServiceTasks.filter(task => task.status !== "completed")}
            emptyMessage="No customer service tasks"
            showAddButton={true}
          />
        </TabsContent>
        
        <TabsContent value="custom">
          <TaskList
            title="Custom Tasks"
            tasks={customTasks.filter(task => task.status !== "completed")}
            emptyMessage="No custom tasks"
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
