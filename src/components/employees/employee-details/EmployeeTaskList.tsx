
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/types";
import { TaskItem } from "./TaskItem";

interface EmployeeTaskListProps {
  pendingTasks: Task[];
  completedTasks: Task[];
}

export const EmployeeTaskList = ({ 
  pendingTasks, 
  completedTasks 
}: EmployeeTaskListProps) => {
  console.log('EmployeeTaskList received:', { pendingTasks, completedTasks });
  
  // Show ALL pending tasks, not just available ones
  // Remove the availability filtering to ensure all tasks are visible
  const availableTasks = pendingTasks.filter(task => task.status === 'pending');
  const inProgressTasks = pendingTasks.filter(task => task.status === 'in_progress');
  
  console.log('Task breakdown:', { 
    availableTasks: availableTasks.length, 
    inProgressTasks: inProgressTasks.length,
    completedTasks: completedTasks.length,
    totalPending: pendingTasks.length
  });
  
  return (
    <Tabs defaultValue="current">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="current">Current Tasks ({pendingTasks.length})</TabsTrigger>
        <TabsTrigger value="history">Task History ({completedTasks.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="current" className="space-y-6 mt-6">
        {/* Pending Tasks */}
        {availableTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Pending Tasks ({availableTasks.length})</h3>
            <div className="space-y-4">
              {availableTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
        
        {/* In Progress Tasks */}
        {inProgressTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">In Progress Tasks ({inProgressTasks.length})</h3>
            <div className="space-y-4">
              {inProgressTasks.map((task) => (
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
