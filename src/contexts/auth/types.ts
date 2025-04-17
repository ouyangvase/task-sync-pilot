
import { User, Notification } from "@/types";

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, department?: string) => Promise<void>;
  logout: () => Promise<void>;
  users: User[];
  fetchUsers: () => Promise<void>;
  resetAppData: () => Promise<void>;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  unreadNotificationsCount: number;
}
