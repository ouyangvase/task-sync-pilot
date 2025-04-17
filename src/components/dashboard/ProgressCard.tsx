
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TaskStats } from "@/types";

interface ProgressCardProps {
  stats: TaskStats;
  title?: string;
}

const ProgressCard = ({ stats, title = "Today's Progress" }: ProgressCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress 
          value={stats.percentComplete} 
          className="h-3"
        />
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm font-medium">{stats.percentComplete}% complete</div>
          <div className="text-sm text-muted-foreground">
            {stats.completed} of {stats.total} tasks
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
