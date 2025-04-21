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
      console.log("Attempting login for:", email);
      
      // Special handling for admin login
      if (email === "admin@tasksync.com" && process.env.NODE_ENV === 'development') {
        console.log("Using admin credentials");
        const adminUser = {
          id: "admin-id",
          name: "Admin User",
          email: "admin@tasksync.com",
          role: "admin" as UserRole,
          isApproved: true,
          permissions: []
        };
        
        setCurrentUser(adminUser);
        localStorage.setItem("currentUser", JSON.stringify(adminUser));
        return;
      }
      
      // Regular user login with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error("Supabase auth error:", authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("No user returned from authentication");
      }

      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Error fetching user profile");
      }

      // Check approval status
      if (!profileData.is_approved) {
        console.log("User not approved:", email);
        await supabase.auth.signOut();
        throw new Error("Your account is pending admin approval");
      }

      const userWithProfile = {
        id: authData.user.id,
        email: authData.user.email || "",
        name: profileData.full_name || authData.user.email?.split('@')[0] || "",
        role: "employee" as UserRole,
        isApproved: profileData.is_approved,
        title: profileData.department || "",
        permissions: [],
        avatar: profileData.avatar_url || ""
      };
      
      setCurrentUser(userWithProfile);
      localStorage.setItem("currentUser", JSON.stringify(userWithProfile));
      console.log("Login successful:", userWithProfile);
      
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
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
      console.log("Registering user:", email, fullName);

      // Sign up with Supabase - use signUp method
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error("Registration error:", error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("No user returned from registration");
      }

      console.log("User signed up successfully:", data.user);

      // The trigger should automatically create the profile, but just in case
      // we'll check if it exists and create it manually if needed
      const { data: profileData, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();
        
      if (profileCheckError) {
        console.error("Error checking profile:", profileCheckError);
      }
      
      // Only create profile manually if it doesn't exist
      if (!profileData) {
        console.log("Profile not found, creating manually");
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            is_approved: false
          });

        if (insertError) {
          console.error("Error creating profile:", insertError);
          toast.error("Account created but profile setup had issues. Contact admin if problems persist.");
        }
      } else {
        console.log("Profile already exists, skipping manual creation");
      }

      const newUser: User = {
        id: data.user.id,
        email: data.user.email || "",
        name: fullName,
        role: "employee",
        isApproved: false,
        permissions: [],
      };

      // Update local state
      setUsers(prevUsers => [...prevUsers, newUser]);
      console.log("Registration successful. Added to local state:", newUser);
      
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
      console.log("Rejecting user:", userId);
      
      // Delete profile from Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error("Error deleting profile from Supabase:", profileError);
        throw new Error("Failed to delete user profile");
      }
      
      // Delete user from Supabase auth (via a service role function in a real app)
      try {
        const { error: authError } = await supabase.functions.invoke('delete-user', {
          body: { userId }
        });
        
        if (authError) {
          console.error("Error deleting auth user:", authError);
          // Continue anyway to update local state
        }
      } catch (fnError) {
        console.error("Error invoking delete-user function:", fnError);
        // Continue anyway to update local state
      }
      
      // Update local state
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      console.log("User rejected and removed from local state");
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
