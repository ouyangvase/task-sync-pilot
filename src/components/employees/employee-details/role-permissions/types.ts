
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
