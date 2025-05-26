
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/types";
import { TaskItem } from "./TaskItem";
import { isTaskAvailable } from "@/lib/taskAvailability";

interface EmployeeTaskListProps {
  pendingTasks: Task[];
  completedTasks: Task[];
}

export const EmployeeTaskList = ({ 
  pendingTasks, 
  completedTasks 
}: EmployeeTaskListProps) => {
  console.log('EmployeeTaskList received:', { pendingTasks, completedTasks });
  
  // Separate available and upcoming tasks for better organization
  const availableTasks = pendingTasks.filter(task => isTaskAvailable(task));
  const upcomingTasks = pendingTasks.filter(task => !isTaskAvailable(task));
  
  console.log('Task breakdown:', { 
    availableTasks: availableTasks.length, 
    upcomingTasks: upcomingTasks.length,
    completedTasks: completedTasks.length 
  });
  
  return (
    <Tabs defaultValue="current">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="current">Current Tasks ({pendingTasks.length})</TabsTrigger>
        <TabsTrigger value="history">Task History ({completedTasks.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="current" className="space-y-6 mt-6">
        {/* Available Tasks */}
        <div>
          <h3 className="text-lg font-medium mb-4">Available Tasks ({availableTasks.length})</h3>
          {availableTasks.length === 0 ? (
            <p className="text-muted-foreground">No tasks available to work on right now</p>
          ) : (
            <div className="space-y-4">
              {availableTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
        
        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Upcoming Tasks ({upcomingTasks.length})</h3>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
        
        {pendingTasks.length === 0 && (
          <p className="text-muted-foreground">No pending tasks found</p>
        )}
      </TabsContent>
      
      <TabsContent value="history" className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">Completed Tasks ({completedTasks.length})</h3>
        
        {completedTasks.length === 0 ? (
          <p className="text-muted-foreground">No completed tasks found</p>
        ) : (
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} isCompleted />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
