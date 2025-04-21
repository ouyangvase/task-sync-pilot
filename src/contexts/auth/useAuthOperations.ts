
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

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Error fetching user profile");
      }

      if (!profileData.is_approved) {
        console.log("User not approved:", email);
        await supabase.auth.signOut();
        throw new Error("Your account is pending admin approval");
      }

      const userWithProfile: User = {
        id: authData.user.id,
        email: authData.user.email || "",
        name: profileData.full_name || authData.user.email?.split('@')[0] || "",
        role: (profileData.role as UserRole) || "employee",
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
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem("currentUser");
    }
  };

  const registerUser = async (email: string, password: string, fullName: string): Promise<void> => {
    try {
      console.log("Registering user:", email, fullName);

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

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          is_approved: false,
          role: "employee"
        });

      if (insertError) {
        console.error("Error creating profile:", insertError);
        throw new Error("Failed to create user profile");
      }

      const newUser: User = {
        id: data.user.id,
        email: data.user.email || "",
        name: fullName,
        role: "employee" as UserRole,
        isApproved: false,
        permissions: [],
      };

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
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);
        
      if (profileError) {
        console.error("Error approving user profile:", profileError);
        throw new Error("Failed to approve user profile");
      }
      
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, isApproved: true };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      console.log("Updated users after approval:", updatedUsers);
    } catch (error) {
      console.error("Error in approveUser:", error);
      throw error;
    }
  };

  const rejectUser = async (userId: string): Promise<void> => {
    try {
      console.log("Rejecting user:", userId);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error("Error deleting profile from Supabase:", profileError);
      }
      
      try {
        const { data, error: authError } = await supabase.functions.invoke('delete-user', {
          body: { userId }
        });
        
        if (authError) {
          console.error("Error deleting auth user:", authError);
        }
      } catch (fnError) {
        console.error("Error invoking delete-user function:", fnError);
      }
      
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      console.log("User rejected and removed from local state");
    } catch (error) {
      console.error("Error in rejectUser:", error);
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
    }
  };

  const syncCurrentUser = (updatedUsers: User[], userId: string, updateFn: (user: User) => User) => {
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
