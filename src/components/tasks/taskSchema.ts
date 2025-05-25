
import * as z from "zod";
import { TaskCategory, TaskRecurrence, TaskPriority } from "@/types";

export const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  assignee: z.string().min(1, { message: "Please select an assignee" }),
  category: z.enum(["follow_up", "new_sales", "admin", "content", "customer_service", "custom"] as const),
  recurrence: z.enum(["once", "daily", "weekly", "monthly"] as const),
  dueDate: z.string().min(1, { message: "Please select a due date and time" }),
  priority: z.enum(["low", "medium", "high"] as const),
  points: z.coerce.number().min(1, { message: "Points must be at least 1" }),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

// Generate default datetime (today at 2 PM)
const getDefaultDateTime = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0);
  return today.toISOString().slice(0, 16); // Format for datetime-local input
};

export const defaultTaskValues: TaskFormValues = {
  title: "",
  description: "",
  assignee: "",
  category: "custom",
  recurrence: "once",
  dueDate: getDefaultDateTime(),
  priority: "medium",
  points: 50,
};
