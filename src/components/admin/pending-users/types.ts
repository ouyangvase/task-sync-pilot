
import { User, UserRole } from "@/types";

export interface PendingUser extends User {
  // Any additional properties specific to pending users
}

export interface PendingUsersListProps {
  pendingUsers: User[];
  onRefresh: () => void;
}

export interface UserRoleSelectProps {
  userId: string;
  selectedRole: UserRole;
  onRoleChange: (userId: string, role: UserRole) => void;
}

export interface UserTitleSelectProps {
  userId: string;
  selectedTitle: string;
  onTitleChange: (userId: string, title: string) => void;
}

export interface UserActionsProps {
  user: User;
  isProcessing: boolean;
  onUpdate: (user: User) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}
