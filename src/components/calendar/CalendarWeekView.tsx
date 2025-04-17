
import { format, parseISO, isSameDay } from "date-fns";
import { Task, TaskStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { getTaskStatusColor } from "@/lib/taskUtils";

interface CalendarWeekViewProps {
  selectedDate: Date;
  tasksByDate: Record<string, Task[]>;
  onTaskClick: (task: Task) => void;
}

const CalendarWeekView = ({ selectedDate, tasksByDate, onTaskClick }: CalendarWeekViewProps) => {
  // Get weekday headers
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Check if a date is today
  const isToday = (date: string) => {
    return isSameDay(parseISO(date), new Date());
  };
  
  return (
    <div className="grid grid-cols-7 gap-3 h-[calc(100vh-300px)] overflow-y-auto">
      {/* Weekday headers */}
      {weekdays.map((day, index) => (
        <div key={day} className="text-center font-medium py-2 border-b">
          {day}
        </div>
      ))}
      
      {/* Days with tasks */}
      {Object.entries(tasksByDate).map(([dateStr, tasks]) => {
        const dayOfWeek = new Date(dateStr).getDay(); // 0 = Sunday, 6 = Saturday
        const formattedDate = format(new Date(dateStr), "d");
        
        return (
          <div 
            key={dateStr} 
            style={{ gridColumn: dayOfWeek + 1 }}
            className={`p-2 border rounded-md ${isToday(dateStr) ? "bg-muted/30" : ""} overflow-y-auto h-full min-h-[150px]`}
          >
            <p className={`text-center mb-2 ${isToday(dateStr) ? "font-bold" : ""}`}>
              {formattedDate}
            </p>
            
            <div className="space-y-2">
              {tasks.map(task => (
                <Card 
                  key={task.id}
                  className={`p-2 cursor-pointer border-l-4`}
                  style={{ borderLeftColor: getTaskStatusColor(task.status) }}
                  onClick={() => onTaskClick(task)}
                >
                  <p className="text-sm font-medium truncate">{task.title}</p>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarWeekView;
