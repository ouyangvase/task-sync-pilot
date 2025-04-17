
import React, { createContext } from "react";
import { AuthContextType } from "./types";
import { canViewUser, canEditUser, getAccessibleUsers } from "./authUtils";
import { useUserManagement } from "./useUserManagement";
import { useSupabaseAuth } from "./useSupabaseAuth";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    loading,
    login,
    logout,
    registerUser,
    users,
    setUsers
  } = useSupabaseAuth();

  const {
    updateUserTitle,
    updateUserRole,
    updateUserPermissions,
    getPendingUsers,
    approveUser,
    rejectUser
  } = useUserManagement(users, setUsers);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login,
        logout,
        users,
        setUsers,
        updateUserTitle,
        updateUserRole,
        updateUserPermissions,
        canViewUser: (viewerId, targetUserId) => canViewUser(users, viewerId, targetUserId),
        canEditUser: (editorId, targetUserId) => canEditUser(users, editorId, targetUserId),
        getAccessibleUsers: (userId) => getAccessibleUsers(users, userId),
        registerUser: async (email, password, fullName) => {
          await registerUser(email, password, fullName);
        },
        approveUser,
        rejectUser,
        getPendingUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
