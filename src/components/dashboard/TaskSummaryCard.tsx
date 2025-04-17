
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface TaskSummaryCardProps {
  title: string;
  count: number;
  type: "completed" | "pending" | "overdue";
}

const TaskSummaryCard = ({ title, count, type }: TaskSummaryCardProps) => {
  const getIcon = () => {
    switch (type) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getCardStyle = () => {
    switch (type) {
      case "completed":
        return "border-green-100 dark:border-green-900";
      case "pending":
        return "border-amber-100 dark:border-amber-900";
      case "overdue":
        return "border-red-100 dark:border-red-900";
      default:
        return "";
    }
  };

  return (
    <Card className={getCardStyle()}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground mt-1">Tasks</p>
      </CardContent>
    </Card>
  );
};

export default TaskSummaryCard;
