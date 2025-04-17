
import { useTasks } from "@/contexts/TaskContext";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface TaskStatusChartProps {
  dateRange: DateRange;
  filters: {
    employee: string;
    category: string;
    status: string;
  };
}

export function TaskStatusChart({ dateRange, filters }: TaskStatusChartProps) {
  const { tasks } = useTasks();
  
  // Filter tasks based on date range and other filters
  const filteredTasks = tasks.filter(task => {
    // Date filter
    if (dateRange.from && dateRange.to) {
      const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
      if (!isWithinInterval(taskDate, { start: dateRange.from, end: dateRange.to })) {
        return false;
      }
    }
    
    // Employee filter
    if (filters.employee !== "all" && task.assignee !== filters.employee) {
      return false;
    }
    
    // Category filter
    if (filters.category !== "all" && task.category !== filters.category) {
      return false;
    }
    
    // We always want to show all statuses in this chart
    return true;
  });
  
  // Count tasks by status
  const statusCounts = filteredTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const data = [
    { name: "Completed", value: statusCounts["completed"] || 0, color: "#10b981" },
    { name: "In Progress", value: statusCounts["in-progress"] || 0, color: "#3b82f6" },
    { name: "Pending", value: statusCounts["pending"] || 0, color: "#9ca3af" },
  ];
  
  // Check if we have any data to display
  const hasData = data.some(item => item.value > 0);
  
  // Config for tooltips
  const chartConfig = {
    "completed": { label: "Completed", color: "#10b981" },
    "in-progress": { label: "In Progress", color: "#3b82f6" },
    "pending": { label: "Pending", color: "#9ca3af" },
  };

  // Custom tooltip renderer
  const renderTooltip = (props: any) => {
    const { payload } = props;
    if (!payload || !payload.length) return null;

    const { name, value, color } = payload[0].payload;
    
    return (
      <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <div className="font-medium">{name}</div>
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
          <div className="flex flex-1 justify-between items-center leading-none">
            <span className="text-muted-foreground">Tasks</span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {value.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[300px] w-full">
      {hasData ? (
        <ChartContainer className="h-full" config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No data available for the selected filters
        </div>
      )}
    </div>
  );
}
