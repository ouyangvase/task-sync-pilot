
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, UserPermission } from "@/types";
import { mockUsers, currentUser as mockCurrentUser } from "@/data/mockData";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  users: User[];
  updateUserTitle: (userId: string, title: string) => void;
  updateUserRole: (userId: string, role: string) => void;
  updateUserPermissions: (userId: string, targetUserId: string, permissions: Partial<UserPermission>) => void;
  canViewUser: (viewerId: string, targetUserId: string) => boolean;
  canEditUser: (editorId: string, targetUserId: string) => boolean;
  getAccessibleUsers: (userId: string) => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(
    // Initialize with empty permissions arrays if not already present
    mockUsers.map(user => ({
      ...user,
      permissions: user.permissions || []
    }))
  );

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser({
        ...parsedUser,
        permissions: parsedUser.permissions || []
      });
    } else {
      // For demo purposes, auto-login as the mock user
      const enhancedUser = {
        ...mockCurrentUser,
        permissions: mockCurrentUser.permissions || []
      };
      setCurrentUser(enhancedUser);
      localStorage.setItem("currentUser", JSON.stringify(enhancedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would validate with a backend
    setLoading(true);
    
    try {
      const user = users.find((u) => u.email === email);
      
      if (!user) {
        throw new Error("Invalid email or password");
      }
      
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const enhancedUser = {
        ...user,
        permissions: user.permissions || []
      };
      
      setCurrentUser(enhancedUser);
      localStorage.setItem("currentUser", JSON.stringify(enhancedUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const updateUserTitle = (userId: string, title: string) => {
    // Update users array with the new title
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, title };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    // Also update currentUser if it's the same user
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, title };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  const updateUserRole = (userId: string, role: string) => {
    // Update users array with the new role
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, role: role as UserRole };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    // Also update currentUser if it's the same user
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, role: role as UserRole };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  // New function to update cross-user permissions
  const updateUserPermissions = (userId: string, targetUserId: string, newPermissions: Partial<UserPermission>) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const permissions = [...(user.permissions || [])];
        
        // Find existing permission for this target user
        const existingPermIndex = permissions.findIndex(p => p.targetUserId === targetUserId);
        
        if (existingPermIndex >= 0) {
          // Update existing permission
          permissions[existingPermIndex] = {
            ...permissions[existingPermIndex],
            ...newPermissions
          };
        } else {
          // Create new permission
          permissions.push({
            targetUserId,
            canView: newPermissions.canView || false,
            canEdit: newPermissions.canEdit || false
          });
        }
        
        return { ...user, permissions };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    // Also update currentUser if it's the same user
    if (currentUser && currentUser.id === userId) {
      const currentPermissions = [...(currentUser.permissions || [])];
      
      const existingPermIndex = currentPermissions.findIndex(p => p.targetUserId === targetUserId);
      
      if (existingPermIndex >= 0) {
        currentPermissions[existingPermIndex] = {
          ...currentPermissions[existingPermIndex],
          ...newPermissions
        };
      } else {
        currentPermissions.push({
          targetUserId,
          canView: newPermissions.canView || false,
          canEdit: newPermissions.canEdit || false
        });
      }
      
      const updatedUser = { ...currentUser, permissions: currentPermissions };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    
    toast.success("User permissions updated");
  };

  // Check if a user can view another user
  const canViewUser = (viewerId: string, targetUserId: string): boolean => {
    // Admins can view everyone
    const viewer = users.find(u => u.id === viewerId);
    if (!viewer) return false;
    
    if (viewer.role === "admin") return true;
    
    // Users can always view themselves
    if (viewerId === targetUserId) return true;
    
    // Check specific permissions
    const permission = viewer.permissions?.find(p => p.targetUserId === targetUserId);
    return !!permission?.canView;
  };

  // Check if a user can edit another user
  const canEditUser = (editorId: string, targetUserId: string): boolean => {
    // Admins can edit everyone
    const editor = users.find(u => u.id === editorId);
    if (!editor) return false;
    
    if (editor.role === "admin") return true;
    
    // Check specific permissions
    const permission = editor.permissions?.find(p => p.targetUserId === targetUserId);
    return !!permission?.canEdit;
  };

  // Get all users that can be viewed by a specific user
  const getAccessibleUsers = (userId: string): User[] => {
    const user = users.find(u => u.id === userId);
    if (!user) return [];
    
    // Admins can see everyone
    if (user.role === "admin") return users;
    
    // Everyone can see themselves
    const accessibleUsers = [user];
    
    // Add users with specific view permissions
    users.forEach(otherUser => {
      if (otherUser.id !== userId && canViewUser(userId, otherUser.id)) {
        accessibleUsers.push(otherUser);
      }
    });
    
    return accessibleUsers;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login,
        logout,
        users,
        updateUserTitle,
        updateUserRole,
        updateUserPermissions,
        canViewUser,
        canEditUser,
        getAccessibleUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
