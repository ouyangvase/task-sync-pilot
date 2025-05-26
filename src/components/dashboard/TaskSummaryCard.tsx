
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useScreenSize } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TaskSummaryCardProps {
  title: string;
  count: number;
  type: "completed" | "pending" | "overdue";
}

const TaskSummaryCard = ({ title, count, type }: TaskSummaryCardProps) => {
  const { isMobile } = useScreenSize();

  const getIcon = () => {
    const iconClass = isMobile ? "h-4 w-4" : "h-5 w-5";
    switch (type) {
      case "completed":
        return <CheckCircle2 className={cn(iconClass, "text-green-500")} />;
      case "pending":
        return <Clock className={cn(iconClass, "text-amber-500")} />;
      case "overdue":
        return <AlertCircle className={cn(iconClass, "text-red-500")} />;
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
    <Card className={cn(getCardStyle(), "touch-manipulation")}>
      <CardHeader className={cn("pb-2", isMobile ? "px-4 pt-4" : "")}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "font-medium", 
            isMobile ? "text-sm" : "text-md"
          )}>
            {title}
          </CardTitle>
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent className={isMobile ? "px-4 pb-4" : ""}>
        <div className={cn(
          "font-bold",
          isMobile ? "text-2xl" : "text-3xl"
        )}>
          {count}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Tasks</p>
      </CardContent>
    </Card>
  );
};

export default TaskSummaryCard;
