
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface TopEmployeesChartProps {
  dateRange: DateRange;
}

interface EmployeeData {
  name: string;
  points: number;
  userId: string;
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
  const employeeData: EmployeeData[] = Object.entries(employeePoints)
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

  // Custom tooltip renderer
  const renderTooltip = (props: any) => {
    const { payload } = props;
    if (!payload || !payload.length) return null;

    const { name, points } = payload[0].payload;

    return (
      <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <div className="font-medium">{name}</div>
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "#8b5cf6" }} />
          <div className="flex flex-1 justify-between items-center leading-none">
            <span className="text-muted-foreground">Points</span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {points.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
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
              <Tooltip content={renderTooltip} />
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
