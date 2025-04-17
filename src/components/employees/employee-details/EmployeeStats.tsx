
import { Clock } from "lucide-react";
import { User } from "@/types";
import { TaskStats, PointsStats } from "@/types";

interface EmployeeStatsProps {
  taskStats: TaskStats;
  pointsStats: PointsStats;
  lastActivityDate: string;
}

export const EmployeeStats = ({ 
  taskStats, 
  pointsStats, 
  lastActivityDate 
}: EmployeeStatsProps) => {
  return (
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
  );
};
