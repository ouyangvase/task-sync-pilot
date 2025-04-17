import { User, UserRole, UserPermission } from "@/types";

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  users: User[];
  setUsers: () => Promise<void>;
  canViewUser: (viewerId: string, targetUserId: string) => boolean;
  canEditUser: (editorId: string, targetUserId: string) => boolean;
  getAccessibleUsers: (userId: string) => User[];
  updateUserRole: (userId: string, role: string) => Promise<User[]>;
  updateUserTitle: (userId: string, title: string) => Promise<User[]>;
  updateUserPermissions: (userId: string, targetUserId: string, permissions: Partial<UserPermission>) => Promise<void>;
  registerUser: (email: string, password: string, fullName: string) => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  getPendingUsers: () => User[];
}
