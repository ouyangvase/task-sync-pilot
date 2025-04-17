
import React, { createContext, useEffect } from "react";
import { mockUsers, currentUser as mockCurrentUser } from "@/data/mockData";
import { AuthContextType } from "./types";
import { canViewUser, canEditUser, getAccessibleUsers } from "./authUtils";
import { useUserManagement } from "./useUserManagement";
import { useAuthOperations } from "./useAuthOperations";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users from localStorage if available
  const storedUsers = localStorage.getItem("users");
  const initialUsers = storedUsers ? JSON.parse(storedUsers) : mockUsers;

  const {
    users,
    setUsers,
    updateUserTitle,
    updateUserRole,
    updateUserPermissions,
    getPendingUsers
  } = useUserManagement(initialUsers);

  const {
    currentUser,
    setCurrentUser,
    loading,
    setLoading,
    login,
    logout,
    registerUser,
    approveUser,
    rejectUser,
    syncCurrentUser
  } = useAuthOperations(users, setUsers);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser({
          ...parsedUser,
          permissions: parsedUser.permissions || []
        });
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("currentUser");
      }
    } else if (process.env.NODE_ENV === 'development') {
      // For demo purposes, auto-login as the mock user in development only
      const enhancedUser = {
        ...mockCurrentUser,
        permissions: mockCurrentUser.permissions || []
      };
      setCurrentUser(enhancedUser);
      localStorage.setItem("currentUser", JSON.stringify(enhancedUser));
    }
    setLoading(false);
  }, []);

  // Debug users list
  useEffect(() => {
    console.log("Current users in AuthProvider:", users);
  }, [users]);

  // Sync currentUser when user permissions change
  const handleUpdateUserPermissions = (userId: string, targetUserId: string, newPermissions: Partial<any>) => {
    const updatedUsers = updateUserPermissions(userId, targetUserId, newPermissions);
    
    // Update currentUser if it's the same user
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
  };

  // Sync currentUser when user title changes
  const handleUpdateUserTitle = (userId: string, title: string) => {
    const updatedUsers = updateUserTitle(userId, title);
    
    // Update currentUser if it's the same user
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, title: title === "none" ? "" : title };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  // Sync currentUser when user role changes
  const handleUpdateUserRole = (userId: string, role: string) => {
    const updatedUsers = updateUserRole(userId, role);
    
    // Update currentUser if it's the same user
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, role: role as any };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
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
        setUsers, // Make setUsers available in the context
        updateUserTitle: handleUpdateUserTitle,
        updateUserRole: handleUpdateUserRole,
        updateUserPermissions: handleUpdateUserPermissions,
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
