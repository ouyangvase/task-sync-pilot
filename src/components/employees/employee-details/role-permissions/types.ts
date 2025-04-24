
import { User, UserRole } from "@/types";

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissionEditorProps {
  employee: User;
  isAdmin: boolean;
  onUpdateRole: (userId: string, role: string) => void;
}

export interface PermissionItemProps {
  permission: Permission;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

// Role relationships structure to enforce proper hierarchy
export interface RoleRelationship {
  role: UserRole;
  canManage: UserRole[];
  level: number; // Hierarchy level
}

// Role hierarchy definition
export const roleHierarchy: Record<UserRole, number> = {
  "admin": 3,
  "manager": 2,
  "team_lead": 1,
  "employee": 0
};

// Role relationships defining which roles can manage which
export const roleRelationships: RoleRelationship[] = [
  {
    role: "admin",
    canManage: ["admin", "manager", "team_lead", "employee"],
    level: 3
  },
  {
    role: "manager",
    canManage: ["team_lead", "employee"],
    level: 2
  },
  {
    role: "team_lead",
    canManage: ["employee"],
    level: 1
  },
  {
    role: "employee",
    canManage: [],
    level: 0
  }
];

// Function to check if a user can manage a specific role
export function canManageRole(userRole: UserRole, targetRole: UserRole): boolean {
  const relationship = roleRelationships.find(r => r.role === userRole);
  return relationship ? relationship.canManage.includes(targetRole) : false;
}
