
import { Task, TaskRecurrence } from "@/types";

export const calculateNextOccurrence = (dueDate: string, recurrence: TaskRecurrence): string => {
  const date = new Date(dueDate);
  
  switch (recurrence) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "once":
    default:
      return dueDate; // No next occurrence for one-time tasks
  }
  
  return date.toISOString();
};

export const createRecurringTaskInstance = (parentTask: Task, nextDueDate: string): Omit<Task, "id" | "createdAt"> => {
  return {
    title: parentTask.title,
    description: parentTask.description,
    assignee: parentTask.assignee,
    assignedBy: parentTask.assignedBy,
    dueDate: nextDueDate,
    status: "pending",
    priority: parentTask.priority,
    category: parentTask.category,
    recurrence: parentTask.recurrence,
    points: parentTask.points,
    isRecurringInstance: true,
    parentTaskId: parentTask.parentTaskId || parentTask.id,
    nextOccurrenceDate: calculateNextOccurrence(nextDueDate, parentTask.recurrence),
  };
};

export const shouldGenerateNextInstance = (task: Task): boolean => {
  return task.recurrence !== "once" && task.status === "completed";
};

export const getRecurringTaskTemplate = (tasks: Task[], taskId: string): Task | null => {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;
  
  // If it's a recurring instance, find the parent template
  if (task.isRecurringInstance && task.parentTaskId) {
    return tasks.find(t => t.id === task.parentTaskId) || null;
  }
  
  // If it's a recurring task but not an instance, it's the template
  if (task.recurrence !== "once" && !task.isRecurringInstance) {
    return task;
  }
  
  return null;
};

export const hasActiveRecurringInstanceForToday = (tasks: Task[], templateId: string): boolean => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return tasks.some(task => {
    if (task.parentTaskId !== templateId) return false;
    
    const taskDueDate = new Date(task.dueDate);
    const taskDueDay = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
    
    // Check if there's an instance due today
    return taskDueDay >= todayStart && taskDueDay < todayEnd;
  });
};

export const generateTodayRecurringInstances = (tasks: Task[]): Omit<Task, "id" | "createdAt">[] => {
  const newInstances: Omit<Task, "id" | "createdAt">[] = [];
  const today = new Date();
  
  // Find all recurring task templates
  const recurringTemplates = tasks.filter(task => 
    task.recurrence !== "once" && 
    !task.isRecurringInstance
  );
  
  for (const template of recurringTemplates) {
    // Check if there's already an instance for today
    if (!hasActiveRecurringInstanceForToday(tasks, template.id)) {
      // Calculate what the due date should be for today
      let nextDueDate = template.dueDate;
      const templateDueDate = new Date(template.dueDate);
      
      // If template is from the past, calculate the next occurrence that should be today
      if (template.recurrence === "daily") {
        // For daily tasks, create an instance for today if none exists
        const todayInstance = new Date(today);
        todayInstance.setHours(templateDueDate.getHours(), templateDueDate.getMinutes(), 0, 0);
        nextDueDate = todayInstance.toISOString();
      } else if (template.recurrence === "weekly") {
        // For weekly tasks, check if today matches the template's day of week
        const templateDayOfWeek = templateDueDate.getDay();
        const todayDayOfWeek = today.getDay();
        
        if (templateDayOfWeek === todayDayOfWeek) {
          const todayInstance = new Date(today);
          todayInstance.setHours(templateDueDate.getHours(), templateDueDate.getMinutes(), 0, 0);
          nextDueDate = todayInstance.toISOString();
        } else {
          continue; // Skip if today is not the scheduled day
        }
      } else if (template.recurrence === "monthly") {
        // For monthly tasks, check if today matches the template's day of month
        const templateDayOfMonth = templateDueDate.getDate();
        const todayDayOfMonth = today.getDate();
        
        if (templateDayOfMonth === todayDayOfMonth) {
          const todayInstance = new Date(today);
          todayInstance.setHours(templateDueDate.getHours(), templateDueDate.getMinutes(), 0, 0);
          nextDueDate = todayInstance.toISOString();
        } else {
          continue; // Skip if today is not the scheduled day
        }
      }
      
      // Only create instance if the due date is today
      const instanceDueDay = new Date(nextDueDate);
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const instanceDay = new Date(instanceDueDay.getFullYear(), instanceDueDay.getMonth(), instanceDueDay.getDate());
      
      if (instanceDay.getTime() === todayStart.getTime()) {
        const newInstance = createRecurringTaskInstance(template, nextDueDate);
        newInstances.push(newInstance);
      }
    }
  }
  
  return newInstances;
};
