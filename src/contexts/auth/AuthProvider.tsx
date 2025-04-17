import React, { createContext, useState, useEffect } from "react";
import { User, UserRole, UserPermission } from "@/types";
import { mockUsers, currentUser as mockCurrentUser } from "@/data/mockData";
import { toast } from "sonner";
import { AuthContextType } from "./types";
import { canViewUser, canEditUser, getAccessibleUsers, updateUserPermissionsHelper } from "./authUtils";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(
    // Initialize with empty permissions arrays if not already present
    mockUsers.map(user => ({
      ...user,
      permissions: user.permissions || [],
      isApproved: user.isApproved !== undefined ? user.isApproved : true,
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

      if (user.isApproved === false) {
        throw new Error("Your account is pending admin approval");
      }
      
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const enhancedUser = {
        ...user,
        permissions: user.permissions || []
      };
      
      setCurrentUser(enhancedUser);
      localStorage.setItem("currentUser", JSON.stringify(enhancedUser));
      
      // Debug log to verify login success
      console.log("Login successful:", enhancedUser);
      
      return enhancedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const registerUser = async (email: string, password: string, fullName: string) => {
    // Check if email already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Create a new user with pending approval
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name: fullName,
      role: "employee", // Default role
      isApproved: false,
      permissions: [],
    };

    // Update users array
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return;
  };

  const approveUser = async (userId: string) => {
    console.log("Approving user:", userId);
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, isApproved: true };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    // Debug log to verify user approval
    console.log("Updated users after approval:", updatedUsers);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return updatedUsers.find(user => user.id === userId);
  };

  const rejectUser = async (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const getPendingUsers = () => {
    return users.filter(user => user.isApproved === false);
  };

  const updateUserTitle = (userId: string, title: string) => {
    // Update users array with the new title
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, title: title === "none" ? "" : title };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    // Also update currentUser if it's the same user
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, title: title === "none" ? "" : title };
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

  const updateUserPermissions = (userId: string, targetUserId: string, newPermissions: Partial<UserPermission>) => {
    const updatedUsers = updateUserPermissionsHelper(users, userId, targetUserId, newPermissions);
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
        canViewUser: (viewerId, targetUserId) => canViewUser(users, viewerId, targetUserId),
        canEditUser: (editorId, targetUserId) => canEditUser(users, editorId, targetUserId),
        getAccessibleUsers: (userId) => getAccessibleUsers(users, userId),
        registerUser,
        approveUser,
        rejectUser,
        getPendingUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
