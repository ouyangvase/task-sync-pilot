
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
  return (
    <Tabs defaultValue="current">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="current">Current Tasks</TabsTrigger>
        <TabsTrigger value="history">Task History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="current" className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">Pending Tasks ({pendingTasks.length})</h3>
        
        {pendingTasks.length === 0 ? (
          <p className="text-muted-foreground">No pending tasks found</p>
        ) : (
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
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
