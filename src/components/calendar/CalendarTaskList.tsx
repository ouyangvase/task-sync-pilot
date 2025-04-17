
import { format, parseISO } from "date-fns";
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { getTaskStatusColor } from "@/lib/taskUtils";

interface CalendarTaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  date?: string;
}

const CalendarTaskList = ({ tasks, onTaskClick, date }: CalendarTaskListProps) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No tasks scheduled {date ? `for ${format(parseISO(date), "MMMM d, yyyy")}` : ""}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-3 border rounded-md cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => onTaskClick(task)}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{task.title}</h3>
            <Badge
              style={{ backgroundColor: getTaskStatusColor(task.status) }}
            >
              {task.status}
            </Badge>
          </div>
          
          <div className="mt-2 text-sm text-muted-foreground">
            <p>{task.description || "No description provided"}</p>
          </div>
          
          <div className="mt-2 flex items-center justify-between text-xs">
            <div>Due: {format(parseISO(task.dueDate), "MMM d, yyyy")}</div>
            <div>Points: {task.points}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarTaskList;
