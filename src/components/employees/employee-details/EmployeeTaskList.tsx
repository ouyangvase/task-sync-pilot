
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/types";
import { TaskItem } from "./TaskItem";

interface EmployeeTaskListProps {
  pendingTasks: Task[];
  completedTasks: Task[];
  onTaskUpdate?: () => void;
}

export const EmployeeTaskList = ({ 
  pendingTasks, 
  completedTasks,
  onTaskUpdate
}: EmployeeTaskListProps) => {
  console.log('EmployeeTaskList received:', { 
    pendingTasks: pendingTasks.length, 
    completedTasks: completedTasks.length,
    pendingTaskIds: pendingTasks.map(t => t.id),
    pendingTaskTitles: pendingTasks.map(t => t.title),
    completedTaskIds: completedTasks.map(t => t.id),
    completedTaskTitles: completedTasks.map(t => t.title)
  });
  
  // Show ALL pending tasks - no availability filtering for display
  const availableTasks = pendingTasks.filter(task => task.status === 'pending');
  const inProgressTasks = pendingTasks.filter(task => task.status === 'in_progress');
  
  console.log('Task breakdown after filtering:', { 
    availableTasks: availableTasks.length, 
    inProgressTasks: inProgressTasks.length,
    completedTasks: completedTasks.length,
    totalPending: pendingTasks.length,
    availableTaskTitles: availableTasks.map(t => t.title),
    inProgressTaskTitles: inProgressTasks.map(t => t.title)
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
                <TaskItem key={task.id} task={task} onTaskUpdate={onTaskUpdate} />
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
                <TaskItem key={task.id} task={task} onTaskUpdate={onTaskUpdate} />
              ))}
            </div>
          </div>
        )}
        
        {pendingTasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-lg mb-2">No pending tasks found</p>
            <p className="text-sm text-muted-foreground">
              Create a new task using the "Assign Task" button above.
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="history" className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">Completed Tasks ({completedTasks.length})</h3>
        
        {completedTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No completed tasks found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} isCompleted onTaskUpdate={onTaskUpdate} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
