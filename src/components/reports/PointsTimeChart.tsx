
import { useTasks } from "@/contexts/TaskContext";
import { DateRange } from "react-day-picker";
import { isWithinInterval, format, addDays, eachDayOfInterval } from "date-fns";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface PointsTimeChartProps {
  dateRange: DateRange;
  filters: {
    employee: string;
    category: string;
    status: string;
  };
  showTasksInstead?: boolean;
}

// Define the type for our chart data
interface ChartDataPoint {
  date: string;
  points: number;
  tasks: number;
  cumulativePoints: number;
  cumulativeTasks: number;
}

export function PointsTimeChart({ dateRange, filters, showTasksInstead = false }: PointsTimeChartProps) {
  const { tasks } = useTasks();
  
  if (!dateRange.from || !dateRange.to) return null;
  
  // Create array of all days in the range
  const daysInRange = eachDayOfInterval({ 
    start: dateRange.from, 
    end: dateRange.to 
  });
  
  // Initialize data with all days in the range
  const chartData: ChartDataPoint[] = daysInRange.map(day => ({
    date: format(day, "yyyy-MM-dd"),
    points: 0,
    tasks: 0,
    cumulativePoints: 0,
    cumulativeTasks: 0,
  }));
  
  // Process tasks and accumulate points/tasks per day
  tasks.forEach(task => {
    // Use completion date for completed tasks, otherwise creation date
    const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
    
    // Skip if not in date range
    if (!isWithinInterval(taskDate, { start: dateRange.from, end: dateRange.to })) {
      return;
    }
    
    // Apply employee filter
    if (filters.employee !== "all" && task.assignee !== filters.employee) {
      return;
    }
    
    // Apply category filter
    if (filters.category !== "all" && task.category !== filters.category) {
      return;
    }
    
    // Apply status filter
    if (filters.status !== "all" && task.status !== filters.status) {
      return;
    }
    
    // Add points to the corresponding day
    const dayKey = format(taskDate, "yyyy-MM-dd");
    const dayIndex = chartData.findIndex(d => d.date === dayKey);
    
    if (dayIndex !== -1) {
      chartData[dayIndex].points += task.points;
      chartData[dayIndex].tasks += 1;
    }
  });
  
  // Calculate cumulative values for a better chart view
  let cumulativePoints = 0;
  let cumulativeTasks = 0;
  
  chartData.forEach(day => {
    cumulativePoints += day.points;
    cumulativeTasks += day.tasks;
    day.cumulativePoints = cumulativePoints;
    day.cumulativeTasks = cumulativeTasks;
  });
  
  const chartConfig = {
    points: { label: "Points", color: "#8b5cf6" },
    tasks: { label: "Tasks", color: "#10b981" },
  };
  
  // Determine which data key to use based on props
  const dataKey = showTasksInstead ? "cumulativeTasks" : "cumulativePoints";
  const chartColor = showTasksInstead ? "#10b981" : "#8b5cf6";
  const chartLabel = showTasksInstead ? "Tasks" : "Points";

  // Custom tooltip renderer
  const renderTooltip = (props: any) => {
    const { payload, label } = props;
    if (!payload || !payload.length) return null;

    const date = payload[0]?.payload?.date;
    const value = payload[0]?.value;

    return (
      <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <div className="font-medium">{date ? format(new Date(date), "MMM dd, yyyy") : ""}</div>
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: chartColor }} />
          <div className="flex flex-1 justify-between items-center leading-none">
            <span className="text-muted-foreground">{chartLabel}</span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {value?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[300px] w-full">
      <ChartContainer className="h-full" config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(tick) => format(new Date(tick), "MMM dd")}
              minTickGap={20}
            />
            <YAxis />
            <Tooltip content={renderTooltip} />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={chartColor} 
              fill={`${chartColor}33`} 
              name={chartLabel}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
