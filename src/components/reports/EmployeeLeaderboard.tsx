
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EmployeeLeaderboardProps {
  dateRange: DateRange;
}

export function EmployeeLeaderboard({ dateRange }: EmployeeLeaderboardProps) {
  const { users } = useAuth();
  const { tasks } = useTasks();
  
  // Only include employees
  const employees = users.filter(user => user.role === "employee");
  
  // Filter tasks by date range
  const filteredTasks = tasks.filter(task => {
    if (!dateRange.from || !dateRange.to) return true;
    
    const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
    return isWithinInterval(taskDate, { start: dateRange.from, end: dateRange.to });
  });
  
  // Calculate statistics for each employee
  const employeeStats = employees.map(employee => {
    const employeeTasks = filteredTasks.filter(task => task.assignee === employee.id);
    const completedTasks = employeeTasks.filter(task => task.status === "completed");
    
    const totalPoints = completedTasks.reduce((sum, task) => sum + task.points, 0);
    
    const totalTasks = employeeTasks.length;
    const completedTasksCount = completedTasks.length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasksCount / totalTasks) * 100) 
      : 0;
    
    return {
      employee,
      points: totalPoints,
      completionRate,
      tasksCompleted: completedTasksCount,
      totalTasks
    };
  });
  
  // Sort by points (highest first)
  const sortedStats = [...employeeStats].sort((a, b) => b.points - a.points);

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Rank</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className="text-right">Completed</TableHead>
            <TableHead className="text-right">Completion Rate</TableHead>
            <TableHead className="text-right">Points Earned</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStats.length > 0 ? (
            sortedStats.map((stat, index) => (
              <TableRow key={stat.employee.id}>
                <TableCell>
                  {index < 3 ? (
                    <Badge className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? "bg-[#FFD700]" : 
                      index === 1 ? "bg-[#C0C0C0]" : 
                      "bg-[#CD7F32]"
                    } text-white`}>
                      <Medal className="h-4 w-4" />
                    </Badge>
                  ) : (
                    <span className="font-medium">{index + 1}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={stat.employee.avatar} />
                      <AvatarFallback>{stat.employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{stat.employee.name}</div>
                      <div className="text-xs text-muted-foreground">{stat.employee.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {stat.tasksCompleted} of {stat.totalTasks}
                </TableCell>
                <TableCell className="text-right">
                  {stat.completionRate}%
                </TableCell>
                <TableCell className="text-right font-medium">
                  {stat.points} pts
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No data available for the selected period
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
