
import { Task, User } from "@/types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@tasksync.com",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
  },
  {
    id: "2",
    name: "John Employee",
    email: "john@tasksync.com",
    role: "employee",
    avatar: "https://ui-avatars.com/api/?name=John+Employee&background=2563eb&color=fff",
  },
  {
    id: "3",
    name: "Sarah Team",
    email: "sarah@tasksync.com",
    role: "employee",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Team&background=0891b2&color=fff",
  },
];

// Current date formatted as ISO string
const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Daily standup meeting",
    description: "Attend the daily standup meeting at 10:00 AM",
    assignee: "2",
    assignedBy: "1",
    category: "daily",
    recurrence: "daily",
    dueDate: today,
    createdAt: yesterday,
    priority: "medium",
    status: "pending",
  },
  {
    id: "task-2",
    title: "Update client documentation",
    description: "Update the client documentation with new features",
    assignee: "2",
    assignedBy: "1",
    category: "custom",
    recurrence: "once",
    dueDate: today,
    createdAt: yesterday,
    priority: "high",
    status: "in-progress",
  },
  {
    id: "task-3",
    title: "Weekly report submission",
    description: "Submit your weekly report by end of day",
    assignee: "2",
    assignedBy: "1",
    category: "custom",
    recurrence: "weekly",
    dueDate: tomorrow,
    createdAt: today,
    priority: "high",
    status: "pending",
  },
  {
    id: "task-4",
    title: "Review code pull requests",
    description: "Review open pull requests from the development team",
    assignee: "3",
    assignedBy: "1",
    category: "daily",
    recurrence: "daily",
    dueDate: today,
    createdAt: yesterday,
    priority: "medium",
    status: "completed",
    completedAt: today,
  },
  {
    id: "task-5",
    title: "Update timesheet",
    description: "Fill out your timesheet for the week",
    assignee: "3",
    assignedBy: "1",
    category: "custom",
    recurrence: "weekly",
    dueDate: today,
    createdAt: yesterday,
    priority: "low",
    status: "pending",
  },
  {
    id: "task-6",
    title: "Client follow-up call",
    description: "Call client to discuss project progress",
    assignee: "3",
    assignedBy: "1",
    category: "custom",
    recurrence: "once",
    dueDate: today,
    createdAt: yesterday,
    priority: "high",
    status: "completed",
    completedAt: today,
  },
];

// Mock current user
export const currentUser = mockUsers[0]; // Default to admin
