
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { User } from "@/types";
import { useTasks } from "@/contexts/task";
import { useAuth } from "@/contexts/auth";
import TaskForm from "@/components/tasks/TaskForm";
import { ShieldOff } from "lucide-react";

// Import refactored components
import { EmployeeHeader } from "./employee-details/EmployeeHeader";
import { EmployeeStats } from "./employee-details/EmployeeStats";
import { EmployeeTitleEditor } from "./employee-details/EmployeeTitleEditor";
import { EmployeeTaskList } from "./employee-details/EmployeeTaskList";
import { ActionButtons } from "./employee-details/ActionButtons";
import { getTitleIcons } from "./employee-details/constants";
import { RolePermissionEditor } from "./employee-details/RolePermissionEditor";
import { UserAccessControl } from "./employee-details/UserAccessControl";

interface EmployeeDetailsProps {
  employee: User;
}

const EmployeeDetails = ({ employee }: EmployeeDetailsProps) => {
  const { getUserTasks, getUserTaskStats, getUserPointsStats } = useTasks();
  const { currentUser, updateUserTitle, updateUserRole, canViewUser, canEditUser } = useAuth();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  // Check permissions
  if (currentUser && !canViewUser(currentUser.id, employee.id)) {
    return (
      <div className="p-8 bg-card rounded-lg border border-border text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-muted/50 rounded-full">
            <ShieldOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have permission to view this employee's details.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === "admin";
  const canEdit = currentUser && canEditUser(currentUser.id, employee.id);
  
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
            <ActionButtons 
              employee={employee} 
              onTaskDialogOpen={handleTaskDialogOpen} 
              canEdit={canEdit}
            />
          </div>
          
          <EmployeeTitleEditor 
            employee={employee}
            titleIcons={titleIcons}
            isAdmin={isAdmin}
            onUpdateTitle={updateUserTitle}
            canEdit={canEdit}
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
      
      <RolePermissionEditor 
        employee={employee}
        isAdmin={isAdmin}
        onUpdateRole={updateUserRole}
      />
      
      <UserAccessControl employee={employee} />
      
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
