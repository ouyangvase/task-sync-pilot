
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface TopEmployeesChartProps {
  dateRange: DateRange;
}

export function TopEmployeesChart({ dateRange }: TopEmployeesChartProps) {
  const { users } = useAuth();
  const { tasks } = useTasks();
  
  // Filter tasks by date range
  const filteredTasks = tasks.filter(task => {
    if (!dateRange.from || !dateRange.to) return true;
    
    const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
    return isWithinInterval(taskDate, { start: dateRange.from, end: dateRange.to });
  });
  
  // Calculate points per employee
  const employeePoints: Record<string, number> = {};
  
  filteredTasks.forEach(task => {
    if (task.status === "completed") {
      employeePoints[task.assignee] = (employeePoints[task.assignee] || 0) + task.points;
    }
  });
  
  // Create data for chart
  const employeeData = Object.entries(employeePoints)
    .map(([userId, points]) => {
      const user = users.find(u => u.id === userId);
      return {
        name: user ? user.name : "Unknown",
        points,
        userId
      };
    })
    .sort((a, b) => b.points - a.points)
    .slice(0, 5); // Get top 5
  
  const chartConfig = {
    points: { label: "Points", color: "#8b5cf6" },
  };

  return (
    <div className="h-[300px] w-full">
      {employeeData.length > 0 ? (
        <ChartContainer className="h-full" config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tickFormatter={(value) => {
                  return value.length > 15 ? `${value.substring(0, 15)}...` : value;
                }}
              />
              <Tooltip
                content={(props) => (
                  <ChartTooltipContent
                    {...props}
                    formatter={(value, name, item) => {
                      const employee = item?.payload?.name;
                      return [value, "Points", employee];
                    }}
                  />
                )}
              />
              <Bar dataKey="points" fill="#8b5cf6" name="Points" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No employee data available for the selected period
        </div>
      )}
    </div>
  );
}
