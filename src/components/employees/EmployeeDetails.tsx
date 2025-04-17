
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { User } from "@/types";
import { useTasks } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import TaskForm from "@/components/tasks/TaskForm";

// Import refactored components
import { EmployeeHeader } from "./employee-details/EmployeeHeader";
import { EmployeeStats } from "./employee-details/EmployeeStats";
import { EmployeeTitleEditor } from "./employee-details/EmployeeTitleEditor";
import { EmployeeTaskList } from "./employee-details/EmployeeTaskList";
import { ActionButtons } from "./employee-details/ActionButtons";
import { getTitleIcons } from "./employee-details/constants";

interface EmployeeDetailsProps {
  employee: User;
}

const EmployeeDetails = ({ employee }: EmployeeDetailsProps) => {
  const { getUserTasks, getUserTaskStats, getUserPointsStats } = useTasks();
  const { currentUser, updateUserTitle } = useAuth();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const tasks = getUserTasks(employee.id);
  const taskStats = getUserTaskStats(employee.id);
  const pointsStats = getUserPointsStats(employee.id);
  
  const pendingTasks = tasks.filter(task => task.status !== "completed");
  const completedTasks = tasks.filter(task => task.status === "completed");
  const titleIcons = getTitleIcons();

  const handleTaskDialogOpen = () => {
    setIsTaskDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsTaskDialogOpen(false);
  };

  const lastActivityDate = tasks.length > 0 
    ? new Date(
        Math.max(...tasks.map(task => 
          task.completedAt 
            ? new Date(task.completedAt).getTime() 
            : new Date(task.createdAt).getTime()
        ))
      ).toLocaleDateString()
    : "No activity";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <EmployeeHeader employee={employee} titleIcons={titleIcons} />
            <ActionButtons employee={employee} onTaskDialogOpen={handleTaskDialogOpen} />
          </div>
          
          <EmployeeTitleEditor 
            employee={employee}
            titleIcons={titleIcons}
            isAdmin={isAdmin}
            onUpdateTitle={updateUserTitle}
          />
        </CardHeader>
        
        <CardContent>
          <EmployeeStats 
            taskStats={taskStats} 
            pointsStats={pointsStats}
            lastActivityDate={lastActivityDate}
          />
        </CardContent>
      </Card>
      
      <EmployeeTaskList 
        pendingTasks={pendingTasks}
        completedTasks={completedTasks}
      />

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign New Task to {employee.name}</DialogTitle>
            <DialogDescription>
              Create a new task for this employee
            </DialogDescription>
          </DialogHeader>
          <TaskForm 
            task={null}
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDetails;
