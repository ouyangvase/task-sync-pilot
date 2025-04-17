
import { Calendar, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { formatTaskStatusForDisplay, getTaskColor } from "@/lib/taskUtils";

interface TaskItemProps {
  task: Task;
  isCompleted?: boolean;
}

export const TaskItem = ({ task, isCompleted = false }: TaskItemProps) => {
  return (
    <Card key={task.id} className="overflow-hidden">
      <div 
        className="h-2" 
        style={{ backgroundColor: isCompleted ? "#10b981" : getTaskColor(task) }}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          {isCompleted ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "Completed"}
              </span>
            </div>
          ) : (
            <Badge variant="outline" className="ml-2">
              {formatTaskStatusForDisplay(task.status)}
            </Badge>
          )}
        </div>
        {!isCompleted && (
          <CardDescription className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" /> Due: {new Date(task.dueDate).toLocaleDateString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <p className="line-clamp-2 text-sm">{task.description || "No description"}</p>
          <Badge 
            variant={isCompleted ? "secondary" : "default"}
            className="ml-auto"
          >
            {task.points} pts
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
