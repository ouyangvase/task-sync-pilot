
import { User, UserRole, UserPermission } from "@/types";

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  canViewUser: (viewerId: string, targetUserId: string) => boolean;
  canEditUser: (editorId: string, targetUserId: string) => boolean;
  getAccessibleUsers: (userId: string) => User[];
  updateUserRole: (userId: string, role: string) => User[];
  updateUserTitle: (userId: string, title: string) => User[];
  updateUserPermissions: (userId: string, targetUserId: string, permissions: Partial<UserPermission>) => void;
  registerUser: (email: string, password: string, fullName: string) => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  getPendingUsers: () => User[];
}
