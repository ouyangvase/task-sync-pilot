
import { useState, useEffect } from "react";
import { User, UserRole, UserPermission } from "@/types";
import { toast } from "sonner";
import { updateUserPermissionsHelper } from "./authUtils";

export const useUserManagement = (initialUsers: User[]) => {
  // Add the new user to initialUsers before setting state
  const newUser: User = {
    id: `user_${Date.now()}`,
    email: "unmap@live.com",
    name: "Team Lead User",
    role: "team_lead",
    isApproved: true,
    permissions: [],
  };
  
  // Only add if the user doesn't already exist
  const userExists = initialUsers.some(user => user.email === newUser.email);
  if (!userExists) {
    initialUsers.push(newUser);
    // Save the updated users to localStorage for persistence
    localStorage.setItem("users", JSON.stringify(initialUsers));
    console.log("Added new user:", newUser);
  }

  const [users, setUsers] = useState<User[]>(
    // Initialize with empty permissions arrays if not already present
    // and ensure isApproved is explicitly set for all users
    initialUsers.map(user => ({
      ...user,
      permissions: user.permissions || [],
      isApproved: user.isApproved !== undefined ? user.isApproved : true, // Default to true for existing users
    }))
  );

  // Effect to ensure any changes to users are saved to localStorage
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

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
