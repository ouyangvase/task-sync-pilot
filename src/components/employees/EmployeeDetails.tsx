
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";
import { useTasks } from "@/contexts/TaskContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, Mail, Trash, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTaskStatusForDisplay, getTaskColor } from "@/lib/taskUtils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import TaskForm from "@/components/tasks/TaskForm";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmployeeDetailsProps {
  employee: User;
}

const EmployeeDetails = ({ employee }: EmployeeDetailsProps) => {
  const { getUserTasks, getUserTaskStats, getUserPointsStats, deleteTask, addTask } = useTasks();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);

  const tasks = getUserTasks(employee.id);
  const taskStats = getUserTaskStats(employee.id);
  const pointsStats = getUserPointsStats(employee.id);
  
  const pendingTasks = tasks.filter(task => task.status !== "completed");
  const completedTasks = tasks.filter(task => task.status === "completed");

  const handleDeleteEmployee = () => {
    // In a real app, this would call an API to delete the user
    toast.success(`Employee ${employee.name} would be deleted`);
    setIsDeleteDialogOpen(false);
  };

  const handleResetPassword = () => {
    // In a real app, this would call an API to reset the user's password
    toast.success(`Password reset email sent to ${employee.email}`);
    setIsResetPasswordDialogOpen(false);
  };

  const handleCreateTask = () => {
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
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{employee.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {employee.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreateTask} variant="default">Assign Task</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Assign New Task to {employee.name}</DialogTitle>
                    <DialogDescription>
                      Create a new task for this employee
                    </DialogDescription>
                  </DialogHeader>
                  {/* Pass the correct props to TaskForm */}
                  <TaskForm 
                    task={null}
                    onClose={handleCloseDialog}
                  />
                </DialogContent>
              </Dialog>
              
              <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserCog className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                      This will send a password reset email to {employee.email}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsResetPasswordDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleResetPassword}>Reset Password</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Employee</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {employee.name}? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <Alert variant="destructive">
                    <AlertDescription>
                      This will permanently delete the employee and all their associated tasks.
                    </AlertDescription>
                  </Alert>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteEmployee}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
            <div className="flex flex-col items-center p-4 bg-secondary/10 rounded-lg">
              <span className="text-sm text-muted-foreground">Tasks Completed</span>
              <span className="text-2xl font-bold">{taskStats.completed}</span>
              <span className="text-xs text-muted-foreground">{taskStats.percentComplete}% completion rate</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-primary/10 rounded-lg">
              <span className="text-sm text-muted-foreground">Points This Month</span>
              <span className="text-2xl font-bold">{pointsStats.earned}</span>
              <span className="text-xs text-muted-foreground">{pointsStats.percentComplete}% of target</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Pending Tasks</span>
              <span className="text-2xl font-bold">{taskStats.pending}</span>
              <span className="text-xs text-muted-foreground">Remaining tasks</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Last Activity</span>
              <span className="text-xl font-bold flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {lastActivityDate}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
                <Card key={task.id} className="overflow-hidden">
                  <div 
                    className="h-2" 
                    style={{ backgroundColor: getTaskColor(task) }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {formatTaskStatusForDisplay(task.status)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="line-clamp-2 text-sm">{task.description || "No description"}</p>
                      <Badge className="ml-auto">{task.points} pts</Badge>
                    </div>
                  </CardContent>
                </Card>
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
                <Card key={task.id} className="overflow-hidden">
                  <div className="h-2 bg-green-500" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "Completed"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="line-clamp-2 text-sm">{task.description || "No description"}</p>
                      <Badge variant="secondary" className="ml-auto">{task.points} pts</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDetails;
