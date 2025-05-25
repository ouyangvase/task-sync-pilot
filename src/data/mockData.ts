import { Task, User, RewardTier, Achievement } from "@/types";

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
const today = new Date();
const yesterday = new Date(Date.now() - 86400000);
const tomorrow = new Date(Date.now() + 86400000);

// Set time to 10 AM for today's tasks
const todayAt10AM = new Date(today);
todayAt10AM.setHours(10, 0, 0, 0);

// Set time to 2 PM for today's tasks
const todayAt2PM = new Date(today);
todayAt2PM.setHours(14, 0, 0, 0);

// Set time to 9 AM for tomorrow's tasks
const tomorrowAt9AM = new Date(tomorrow);
tomorrowAt9AM.setHours(9, 0, 0, 0);

// Mock Tasks with proper recurring task structure
export const mockTasks: Task[] = [
  // Daily recurring task template
  {
    id: "daily-standup-template",
    title: "Daily standup meeting",
    description: "Attend the daily standup meeting at 10:00 AM",
    assignee: "2",
    category: "admin",
    recurrence: "daily",
    dueDate: todayAt10AM.toISOString(),
    createdAt: yesterday.toISOString(),
    priority: "medium",
    status: "pending",
    points: 50,
    nextOccurrenceDate: tomorrowAt9AM.toISOString(),
  },
  // Weekly recurring task template
  {
    id: "weekly-report-template",
    title: "Weekly report submission",
    description: "Submit your weekly report by end of day",
    assignee: "2",
    category: "custom",
    recurrence: "weekly",
    dueDate: todayAt2PM.toISOString(),
    createdAt: yesterday.toISOString(),
    priority: "high",
    status: "pending",
    points: 75,
    nextOccurrenceDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
  // One-time tasks
  {
    id: "task-2",
    title: "Update client documentation",
    description: "Update the client documentation with new features",
    assignee: "2",
    category: "custom",
    recurrence: "once",
    dueDate: todayAt2PM.toISOString(),
    createdAt: yesterday.toISOString(),
    priority: "high",
    status: "in_progress",
    points: 100,
  },
  {
    id: "task-6",
    title: "Client follow-up call",
    description: "Call client to discuss project progress",
    assignee: "3",
    category: "follow_up",
    recurrence: "once",
    dueDate: yesterday.toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    priority: "high",
    status: "completed",
    completedAt: yesterday.toISOString(),
    points: 80,
  },
  // Future task that should not be actionable yet
  {
    id: "future-task",
    title: "Prepare next month's presentation",
    description: "Create slides for next month's team presentation",
    assignee: "2",
    category: "content",
    recurrence: "once",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: today.toISOString(),
    priority: "medium",
    status: "pending",
    points: 120,
  },
];

// Mock current user
export const currentUser = mockUsers[0]; // Default to admin

// Mock Achievements
export const mockAchievements: Achievement[] = [
  {
    id: "1",
    title: "Task Master",
    description: "Completed 50 tasks",
    icon: "🏆",
    category: "task",
    criteria: {
      type: "task_count",
      value: 50,
      timeframe: "all_time"
    },
    pointsRequired: 500,
    isUnlocked: true,
    unlockedAt: "2023-12-15",
    unlockedDate: "2023-12-15",
  },
  {
    id: "2",
    title: "Early Bird",
    description: "Completed 10 tasks before their due date",
    icon: "🐦",
    category: "task",
    criteria: {
      type: "task_count",
      value: 10,
      timeframe: "all_time"
    },
    pointsRequired: 250,
    isUnlocked: true,
    unlockedAt: "2024-01-22",
    unlockedDate: "2024-01-22", 
  },
  {
    id: "3",
    title: "Perfectionist",
    description: "Achieved 100% completion rate for a month",
    icon: "🌟",
    category: "streak",
    criteria: {
      type: "custom",
      value: 100,
      timeframe: "monthly"
    },
    pointsRequired: 1000,
    isUnlocked: false,
    currentPoints: 750,
  },
  {
    id: "4",
    title: "Team Player",
    description: "Helped teammates complete 20 tasks",
    icon: "👥",
    category: "special",
    criteria: {
      type: "custom",
      value: 20,
      timeframe: "all_time"
    },
    pointsRequired: 800,
    isUnlocked: false,
    currentPoints: 350,
  },
  {
    id: "5",
    title: "Efficiency Expert",
    description: "Completed 5 tasks in a single day",
    icon: "⚡",
    category: "task",
    criteria: {
      type: "task_count",
      value: 5,
      timeframe: "daily"
    },
    pointsRequired: 300,
    isUnlocked: true,
    unlockedAt: "2024-02-10",
    unlockedDate: "2024-02-10",
  }
];
