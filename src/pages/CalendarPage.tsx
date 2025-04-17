
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "@/types";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import CalendarTaskList from "@/components/calendar/CalendarTaskList";
import CalendarMonthView from "@/components/calendar/CalendarMonthView";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("month");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  
  useEffect(() => {
    document.title = "Calendar | TaskSync Pilot";
  }, []);
  
  if (!currentUser) return null;

  const userTasks = tasks.filter(task => 
    currentUser.role === "admin" || task.assignee === currentUser.id
  );
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };
  
  const nextPeriod = () => {
    if (viewMode === "week") {
      const nextWeek = new Date(selectedDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setSelectedDate(nextWeek);
    } else {
      const nextMonth = new Date(selectedDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setSelectedDate(nextMonth);
    }
  };
  
  const prevPeriod = () => {
    if (viewMode === "week") {
      const prevWeek = new Date(selectedDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setSelectedDate(prevWeek);
    } else {
      const prevMonth = new Date(selectedDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setSelectedDate(prevMonth);
    }
  };
  
  const getDateRangeText = () => {
    if (viewMode === "week") {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } else {
      return format(selectedDate, "MMMM yyyy");
    }
  };
  
  // Get tasks for the selected date
  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return userTasks.filter(task => task.dueDate === dateStr);
  };
  
  // Get tasks for the selected time range
  const getTasksForRange = () => {
    let startDate, endDate;
    
    if (viewMode === "week") {
      startDate = startOfWeek(selectedDate);
      endDate = endOfWeek(selectedDate);
    } else {
      startDate = startOfMonth(selectedDate);
      endDate = endOfMonth(selectedDate);
    }
    
    const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
    const tasksByDate: Record<string, Task[]> = {};
    
    daysInRange.forEach(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      tasksByDate[dateStr] = getTasksForDate(date);
    });
    
    return tasksByDate;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        
        <Tabs value={viewMode} onValueChange={(value: "week" | "month") => setViewMode(value)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={prevPeriod}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-medium">{getDateRangeText()}</h2>
          <Button variant="outline" size="icon" onClick={nextPeriod}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
          Today
        </Button>
      </div>
      
      {viewMode === "week" ? (
        <CalendarWeekView 
          selectedDate={selectedDate} 
          tasksByDate={getTasksForRange()}
          onTaskClick={handleTaskClick}
        />
      ) : (
        <CalendarMonthView 
          selectedDate={selectedDate}
          tasksByDate={getTasksForRange()}
          onTaskClick={handleTaskClick}
        />
      )}
      
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-xl">{selectedTask.title}</h3>
                {selectedTask.description && (
                  <p className="text-muted-foreground mt-2">{selectedTask.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm">{selectedTask.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <p className="text-sm">{selectedTask.priority}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Points</p>
                  <p className="text-sm">{selectedTask.points}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm">{selectedTask.dueDate}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
