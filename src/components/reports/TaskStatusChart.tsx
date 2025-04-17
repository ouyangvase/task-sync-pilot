
import { useTasks } from "@/contexts/TaskContext";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

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
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const { name, value, color } = payload[0].payload;
                    return (
                      <ChartTooltipContent
                        items={[
                          {
                            label: name,
                            value: String(value),
                            color: color
                          }
                        ]}
                        formattedValue={String(value)}
                        label={name}
                      />
                    );
                  }
                  return null;
                }}
              />
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
