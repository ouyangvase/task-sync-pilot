
// This file is kept for backward compatibility
// The app now uses Supabase for authentication and data storage
// This empty file prevents import errors in existing components

import { Task, User, RewardTier } from "@/types";

// Default admin user (will be replaced by Supabase authentication)
export const mockUsers: User[] = [];
export const currentUser = null;

// Empty task array (will be replaced by Supabase data)
export const mockTasks: Task[] = [];
