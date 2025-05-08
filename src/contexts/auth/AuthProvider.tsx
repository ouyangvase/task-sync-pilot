import React, { createContext, useState, useEffect } from "react";
import { User, UserRole, UserPermission } from "@/types";
import { mockUsers, currentUser as mockCurrentUser } from "@/data/mockData";
import { toast } from "sonner";
import { AuthContextType } from "./types";
import { canViewUser, canEditUser, getAccessibleUsers, updateUserPermissionsHelper } from "./authUtils";
import { supabase } from "@/integrations/supabase/client";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(
    // Initialize with empty permissions arrays if not already present
    mockUsers.map(user => ({
      ...user,
      permissions: user.permissions || [],
      isApproved: true, // All users are automatically approved now
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

  const login = async (email: string, password: string): Promise<void> => {
    // In a real app, this would validate with a backend
    setLoading(true);
    
    try {
      // Debug logs to see what's happening
      console.log("Attempting login for:", email);
      console.log("Available users:", users);
      
      const user = users.find((u) => u.email === email);
      
      if (!user) {
        console.log("User not found:", email);
        throw new Error("Invalid email or password");
      }

      // Debug log for user found
      console.log("Found user:", user);
      
      // Removed the approval check since all users are now automatically approved
      
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

      // Call Supabase auth.signIn if using Supabase auth
      try {
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
      } catch (supabaseError) {
        console.error("Supabase auth error:", supabaseError);
        // Continue with mock login even if Supabase fails
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    
    // Sign out from Supabase if using Supabase auth
    try {
      supabase.auth.signOut();
    } catch (error) {
      console.error("Supabase signout error:", error);
    }
  };

  const registerUser = async (email: string, password: string, fullName: string): Promise<void> => {
    // Check if email already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Create a new user (automatically approved)
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name: fullName,
      role: "employee", // Default role
      isApproved: true, // All users are automatically approved
      permissions: [],
    };

    // Debug log
    console.log("Registering new user:", newUser);

    // Update users array
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    // Try to register with Supabase if using Supabase auth
    try {
      await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          },
        }
      });
    } catch (supabaseError) {
      console.error("Supabase registration error:", supabaseError);
      // Continue with mock registration even if Supabase fails
    }
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  // Keep only the user role update functionality, no need for approval methods
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
        registerUser
        // Removed approval-related methods
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
