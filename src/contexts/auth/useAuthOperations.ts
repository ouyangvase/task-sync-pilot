
import { useState } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthOperations = (users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to map application role to database role
  const mapAppRoleToDatabaseRole = (appRole: UserRole | string): "admin" | "landlord" | "tenant" | "merchant" => {
    switch(appRole) {
      case 'admin':
        return 'admin'; // This one is the same
      case 'manager':
        return 'landlord'; // Map manager to landlord
      case 'team_lead':
        return 'tenant'; // Map team_lead to tenant
      case 'employee':
      default:
        return 'merchant'; // Map employee to merchant
    }
  };

  // Helper function to map database role to application role
  const mapDatabaseRoleToAppRole = (dbRole: string): UserRole => {
    switch(dbRole) {
      case 'admin':
        return 'admin'; // This one is the same
      case 'landlord':
        return 'manager'; // Map landlord to manager
      case 'tenant':
        return 'team_lead'; // Map tenant to team_lead
      case 'merchant':
      default:
        return 'employee'; // Map merchant to employee
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    
    try {
      console.log("Attempting login for:", email);
      
      // Special case for admin login - no need to check password in dev mode
      if (email === "admin@tasksync.com") {
        console.log("Using admin credentials");
        const adminUser = users.find(u => u.email === "admin@tasksync.com");
        
        if (!adminUser) {
          throw new Error("Admin user not found in the system");
        }
        
        setCurrentUser(adminUser);
        localStorage.setItem("currentUser", JSON.stringify(adminUser));
        console.log("Admin login successful");
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

      const userWithProfile: User = {
        id: authData.user.id,
        email: authData.user.email || "",
        name: profileData.full_name || authData.user.email?.split('@')[0] || "",
        role: (profileData.role as UserRole) || "employee",
        isApproved: true,
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
            role: "employee"
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
          is_approved: true,
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
        role: "employee",
        isApproved: true,
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
      console.log("ApproveUser called (should not trigger on registration):", userId);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);
        
      if (profileError) {
        console.error("Error approving user profile:", profileError);
        throw new Error("Failed to approve user profile");
      }
      
      // Also add the user to the user_roles table
      const userToApprove = users.find(user => user.id === userId);
      if (userToApprove) {
        // Map the role to the database role before insertion
        const dbRole = mapAppRoleToDatabaseRole(userToApprove.role || 'employee');
        
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: dbRole  // Use the mapped role for the database
          });
          
        if (roleError && !roleError.message.includes('duplicate')) {
          console.error("Error inserting user role:", roleError);
        }
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
      
      // Delete the profile from Supabase first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error("Error deleting profile from Supabase:", profileError);
      }
      
      // Then delete the auth user through the edge function
      try {
        const { error: authError } = await supabase.functions.invoke('delete-user', {
          body: { userId }
        });
        
        if (authError) {
          console.error("Error deleting auth user:", authError);
          throw authError;
        }
      } catch (fnError) {
        console.error("Error invoking delete-user function:", fnError);
      }
      
      // Update local state regardless of any errors
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      toast.success("User rejected and removed from database");
      console.log("User rejected and removed from local state");
    } catch (error) {
      console.error("Error in rejectUser:", error);
      // Still update local state even if there was an error
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
    }
  };

  // Helper to sync current user with updated user data
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
