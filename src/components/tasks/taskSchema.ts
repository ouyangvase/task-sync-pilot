
import * as z from "zod";
import { TaskCategory, TaskRecurrence, TaskPriority } from "@/types";

export const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  assignee: z.string().min(1, { message: "Please select an assignee" }),
  category: z.enum(["daily", "custom"] as const),
  recurrence: z.enum(["once", "daily", "weekly", "monthly"] as const),
  dueDate: z.string().min(1, { message: "Please select a due date" }),
  priority: z.enum(["low", "medium", "high"] as const),
  points: z.coerce.number().min(1, { message: "Points must be at least 1" }),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const defaultTaskValues: TaskFormValues = {
  title: "",
  description: "",
  assignee: "",
  category: "custom",
  recurrence: "once",
  dueDate: new Date().toISOString().split("T")[0],
  priority: "medium",
  points: 50,
};
