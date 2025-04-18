
import { useState } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthOperations = (users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Debug logs to see what's happening
      console.log("Attempting login for:", email);
      
      // First try to login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Supabase login error:", error);
        
        // For development only: Try fallback to mock data
        if (process.env.NODE_ENV === 'development') {
          const user = users.find((u) => u.email === email);
          
          if (!user) {
            console.log("User not found in mock data:", email);
            throw new Error("Invalid email or password");
          }
          
          // Debug log for found user
          console.log("Found user in mock data:", user);
          
          // Check if user is approved
          if (user.isApproved === false) {
            console.log("User not approved:", email);
            throw new Error("Your account is pending admin approval");
          }
          
          const enhancedUser = {
            ...user,
            permissions: user.permissions || []
          };
          
          setCurrentUser(enhancedUser);
          localStorage.setItem("currentUser", JSON.stringify(enhancedUser));
          console.log("Mock login successful:", enhancedUser);
          return;
        }
        
        throw error;
      }
      
      if (!data.user) {
        throw new Error("No user returned from Supabase");
      }
      
      // Get user profile data from our profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Error fetching user profile");
      }
      
      // Check if user is approved
      if (profileData.is_approved === false) {
        console.log("User not approved:", email);
        throw new Error("Your account is pending admin approval");
      }
      
      const userWithProfile: User = {
        id: data.user.id,
        email: data.user.email || "",
        name: profileData.name || data.user.email?.split('@')[0] || "",
        role: profileData.role as UserRole,
        isApproved: profileData.is_approved,
        title: profileData.title || "",
        permissions: [],
        avatar: profileData.avatar || ""
      };
      
      setCurrentUser(userWithProfile);
      localStorage.setItem("currentUser", JSON.stringify(userWithProfile));
      
      // Debug log to verify login success
      console.log("Supabase login successful:", userWithProfile);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Try to logout from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Always clear local state regardless of Supabase result
      setCurrentUser(null);
      localStorage.removeItem("currentUser");
    }
  };

  const registerUser = async (email: string, password: string, fullName: string): Promise<void> => {
    try {
      // First check if email already exists in mock users
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
            role: "employee"
          }
        }
      });

      if (error) {
        console.error("Registration error:", error);
        throw new Error(error.message || "Registration failed");
      }

      if (!data.user) {
        throw new Error("No user returned from Supabase");
      }

      console.log("User registered successfully in Supabase:", data.user);
      
      // We don't need to manually create a profile as we have a database trigger that does this
      
      // Add to local state for immediate UI update
      const newUser: User = {
        id: data.user.id,
        email: data.user.email || "",
        name: fullName,
        role: "employee",
        isApproved: false,
        permissions: [],
      };

      setUsers(prevUsers => [...prevUsers, newUser]);
      
      console.log("Added user to local state:", newUser);
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const approveUser = async (userId: string): Promise<void> => {
    try {
      console.log("Approving user:", userId);
      
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);
        
      if (error) {
        console.error("Error approving user in Supabase:", error);
        throw new Error("Failed to approve user");
      }
      
      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, isApproved: true };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      
      // Debug log to verify user approval
      console.log("Updated users after approval:", updatedUsers);
    } catch (error) {
      console.error("Error in approveUser:", error);
      throw error;
    }
  };

  const rejectUser = async (userId: string): Promise<void> => {
    try {
      // Delete from Supabase auth
      const { data: userData, error: userError } = await supabase.auth.admin.deleteUser(userId);
      
      if (userError) {
        console.error("Error deleting user from Supabase auth:", userError);
        // Continue with local deletion even if Supabase fails
      } else {
        console.log("User deleted from Supabase auth:", userData);
      }
      
      // Update local state
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error in rejectUser:", error);
      // Continue with local deletion even if Supabase fails
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
    }
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
