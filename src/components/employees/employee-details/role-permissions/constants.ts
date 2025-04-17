
import { UserRole } from "@/types";
import { Permission } from "./types";

export const availableRoles = [
  { id: "employee", name: "Employee", description: "Regular employee with limited access" },
  { id: "team_lead", name: "Team Lead", description: "Can assign and manage team tasks" },
  { id: "manager", name: "Manager", description: "Department manager with extended access" },
  { id: "admin", name: "Admin", description: "Full system access" }
];

export const availablePermissions: Permission[] = [
  { id: "view_tasks", name: "View Tasks", description: "Can view all tasks in the system" },
  { id: "create_tasks", name: "Create Tasks", description: "Can create new tasks" },
  { id: "edit_tasks", name: "Edit Tasks", description: "Can edit existing tasks" },
  { id: "assign_tasks", name: "Assign Tasks", description: "Can assign tasks to others" },
  { id: "view_reports", name: "View Reports", description: "Can view performance reports" },
  { id: "manage_users", name: "Manage Users", description: "Can manage user accounts" }
];

// Default permissions by role
export const rolePermissions: Record<string, string[]> = {
  employee: ["view_tasks"],
  team_lead: ["view_tasks", "create_tasks", "edit_tasks", "assign_tasks"],
  manager: ["view_tasks", "create_tasks", "edit_tasks", "assign_tasks", "view_reports"],
  admin: ["view_tasks", "create_tasks", "edit_tasks", "assign_tasks", "view_reports", "manage_users"]
};
