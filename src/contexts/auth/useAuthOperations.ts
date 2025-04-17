
import { useState } from "react";
import { User } from "@/types";

export const useAuthOperations = (users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<void> => {
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

      if (user.isApproved === false) {
        console.log("User not approved:", email);
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
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const registerUser = async (email: string, password: string, fullName: string): Promise<void> => {
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

    // Debug log
    console.log("Registering new user:", newUser);

    // Update users array
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const approveUser = async (userId: string): Promise<void> => {
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
  };

  const rejectUser = async (userId: string): Promise<void> => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const syncCurrentUser = (updatedUsers: User[], userId: string, updateFn: (user: User) => User) => {
    // Update currentUser if it's the same user being modified
    if (currentUser && currentUser.id === userId) {
      const updatedUser = updateFn({...currentUser});
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      return updatedUser;
    }
    return currentUser;
  };

  return {
    currentUser,
    setCurrentUser,
    loading,
    setLoading,
    login,
    logout,
    registerUser,
    approveUser,
    rejectUser,
    syncCurrentUser,
  };
};
