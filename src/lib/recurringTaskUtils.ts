
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

export const hasActiveRecurringInstance = (tasks: Task[], templateId: string): boolean => {
  return tasks.some(task => 
    task.parentTaskId === templateId && 
    task.status !== "completed" &&
    new Date(task.dueDate) >= new Date()
  );
};

export const generateMissingRecurringInstances = (tasks: Task[]): Omit<Task, "id" | "createdAt">[] => {
  const newInstances: Omit<Task, "id" | "createdAt">[] = [];
  const now = new Date();
  
  // Find all recurring task templates
  const recurringTemplates = tasks.filter(task => 
    task.recurrence !== "once" && 
    !task.isRecurringInstance
  );
  
  for (const template of recurringTemplates) {
    // Check if there's an active instance for this template
    if (!hasActiveRecurringInstance(tasks, template.id)) {
      // Calculate the next due date based on the template's schedule
      let nextDueDate = template.nextOccurrenceDate || template.dueDate;
      
      // If the next occurrence is in the past, calculate the next future occurrence
      while (new Date(nextDueDate) < now) {
        nextDueDate = calculateNextOccurrence(nextDueDate, template.recurrence);
      }
      
      // Create a new instance
      const newInstance = createRecurringTaskInstance(template, nextDueDate);
      newInstances.push(newInstance);
    }
  }
  
  return newInstances;
};
