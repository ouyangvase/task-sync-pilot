
import { format, parseISO, getDate, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { getTaskStatusColor } from "@/lib/taskUtils";

interface CalendarMonthViewProps {
  selectedDate: Date;
  tasksByDate: Record<string, Task[]>;
  onTaskClick: (task: Task) => void;
}

const CalendarMonthView = ({ selectedDate, tasksByDate, onTaskClick }: CalendarMonthViewProps) => {
  const startDate = startOfMonth(selectedDate);
  const endDate = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Start of the grid (might be previous month)
  const startOffset = getDay(startDate);
  
  // Check if a date is today
  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };
  
  // Check if date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth();
  };
  
  // Generate weekday headers
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Function to get tasks for a specific date
  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    return tasksByDate[dateStr] || [];
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="grid grid-cols-7 bg-muted">
        {weekdays.map(day => (
          <div key={day} className="text-center py-2 font-medium text-sm">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7">
        {/* Empty cells for days of the week before the first of the month */}
        {Array.from({ length: startOffset }).map((_, index) => (
          <div key={`empty-${index}`} className="min-h-[100px] p-1 border-t border-r"></div>
        ))}
        
        {/* Calendar days */}
        {daysInMonth.map(date => {
          const dateNumber = getDate(date);
          const tasks = getTasksForDate(date);
          
          return (
            <div 
              key={date.toISOString()}
              className={`min-h-[100px] p-1 border-t border-r relative ${
                isToday(date) ? "bg-muted/30" : ""
              } ${
                !isCurrentMonth(date) ? "text-muted-foreground" : ""
              }`}
            >
              <span className={`inline-block w-6 h-6 text-center rounded-full ${
                isToday(date) ? "bg-primary text-primary-foreground" : ""
              }`}>
                {dateNumber}
              </span>
              
              <div className="mt-1 space-y-1 max-h-[70px] overflow-y-auto">
                {tasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id}
                    className="text-xs truncate p-1 rounded cursor-pointer"
                    style={{ backgroundColor: `${getTaskStatusColor(task.status)}30` }}
                    onClick={() => onTaskClick(task)}
                  >
                    {task.title}
                  </div>
                ))}
                {tasks.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonthView;
