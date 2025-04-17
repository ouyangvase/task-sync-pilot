
import { Permission } from "./types";

export const availablePermissions: Permission[] = [
  {
    id: "view_tasks",
    name: "View Tasks",
    description: "Can view tasks in the system"
  },
  {
    id: "manage_tasks",
    name: "Manage Tasks",
    description: "Can create, edit and delete tasks"
  },
  {
    id: "assign_tasks",
    name: "Assign Tasks",
    description: "Can assign tasks to users"
  },
  {
    id: "complete_tasks",
    name: "Complete Tasks",
    description: "Can mark tasks as completed"
  },
  {
    id: "view_reports",
    name: "View Reports",
    description: "Can view reports and analytics"
  },
  {
    id: "manage_users",
    name: "Manage Users",
    description: "Can add, edit and manage users"
  },
  {
    id: "view_employees",
    name: "View Employees",
    description: "Can view employees in the system"
  },
  {
    id: "edit_employees",
    name: "Edit Employees",
    description: "Can edit employee information"
  },
  {
    id: "view_achievements",
    name: "View Achievements",
    description: "Can view achievements"
  },
  {
    id: "manage_achievements",
    name: "Manage Achievements",
    description: "Can create, edit and delete achievements"
  }
];

export const availableRoles = [
  {
    id: "admin",
    name: "Admin"
  },
  {
    id: "manager",
    name: "Manager"
  },
  {
    id: "team_lead",
    name: "Team Lead"
  },
  {
    id: "employee",
    name: "Employee"
  }
];

// Define permissions for each role
export const rolePermissions: Record<string, string[]> = {
  admin: [
    "view_tasks",
    "manage_tasks",
    "assign_tasks",
    "complete_tasks",
    "view_reports",
    "manage_users",
    "view_employees",
    "edit_employees",
    "view_achievements",
    "manage_achievements"
  ],
  manager: [
    "view_tasks",
    "manage_tasks",
    "assign_tasks",
    "complete_tasks",
    "view_reports",
    "view_employees",
    "edit_employees",
    "view_achievements",
    "manage_achievements"
  ],
  team_lead: [
    "view_tasks",
    "manage_tasks",
    "assign_tasks",
    "complete_tasks",
    "view_employees",
    "view_achievements"
  ],
  employee: [
    "view_tasks",
    "complete_tasks",
    "view_achievements"
  ]
};
