
import { useState } from "react";
import { Task, TaskStatus } from "@/types";
import { useTasks } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskCard from "@/components/tasks/TaskCard";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

const MyTasks = () => {
  const { currentUser } = useAuth();
  const { getUserTasks, updateTask } = useTasks();
  const [activeTab, setActiveTab] = useState<"current" | "in-progress" | "completed">("current");
  
  if (!currentUser) return null;
  
  const allTasks = getUserTasks(currentUser.id);
  
  const currentTasks = allTasks.filter(task => task.status === "pending");
  const inProgressTasks = allTasks.filter(task => task.status === "in-progress");
  const completedTasks = allTasks.filter(task => task.status === "completed");
  
  const handleUpdateStatus = (task: Task, newStatus: TaskStatus) => {
    updateTask(task.id, { status: newStatus });
    
    const statusMessages = {
      "pending": "Task marked as Current",
      "in-progress": "Task marked as In Progress",
      "completed": "Task completed! Points awarded."
    };
    
    toast.success(statusMessages[newStatus]);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">My Tasks</CardTitle>
        <CardDescription>
          Manage and track your assigned tasks
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="current" className="relative">
              Current
              {currentTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">{currentTasks.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress
              {inProgressTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">{inProgressTasks.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {completedTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">{completedTasks.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {currentTasks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No current tasks
              </div>
            ) : (
              <div className="space-y-4">
                {currentTasks.map(task => (
                  <div key={task.id} className="relative">
                    <TaskCard 
                      task={task} 
                      showControls={false}
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleUpdateStatus(task, "in-progress")}
                        className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Start <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in-progress">
            {inProgressTasks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No tasks in progress
              </div>
            ) : (
              <div className="space-y-4">
                {inProgressTasks.map(task => (
                  <div key={task.id} className="relative">
                    <TaskCard 
                      task={task} 
                      showControls={false}
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleUpdateStatus(task, "completed")}
                        className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Complete <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedTasks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No completed tasks
              </div>
            ) : (
              <div className="space-y-4">
                {completedTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    showControls={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MyTasks;
