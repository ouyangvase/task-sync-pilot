
import { useState } from "react";
import { User, UserRole, UserPermission } from "@/types";
import { toast } from "sonner";
import { updateUserPermissionsHelper } from "./authUtils";

export const useUserManagement = (initialUsers: User[]) => {
  const [users, setUsers] = useState<User[]>(
    // Initialize with empty permissions arrays if not already present
    initialUsers.map(user => ({
      ...user,
      permissions: user.permissions || [],
      isApproved: user.isApproved !== undefined ? user.isApproved : true,
    }))
  );

  const updateUserTitle = (userId: string, title: string) => {
    // Update users array with the new title
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, title: title === "none" ? "" : title };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    return updatedUsers;
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
    return updatedUsers;
  };

  const updateUserPermissions = (userId: string, targetUserId: string, newPermissions: Partial<UserPermission>) => {
    const updatedUsers = updateUserPermissionsHelper(users, userId, targetUserId, newPermissions);
    setUsers(updatedUsers);
    toast.success("User permissions updated");
    return updatedUsers;
  };

  const getPendingUsers = () => {
    return users.filter(user => user.isApproved === false);
  };

  return {
    users,
    setUsers,
    updateUserTitle,
    updateUserRole,
    updateUserPermissions,
    getPendingUsers,
  };
};
