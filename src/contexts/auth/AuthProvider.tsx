
import React, { createContext, useState, useEffect } from "react";
import { User, UserRole, UserPermission } from "@/types";
import { toast } from "sonner";
import { AuthContextType } from "./types";
import { canViewUser, canEditUser, getAccessibleUsers, updateUserPermissionsHelper } from "./authUtils";
import { supabase } from "@/integrations/supabase/client";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Function to fetch all user profiles from Supabase
  const fetchAllProfiles = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) {
        console.error("Error fetching all profiles:", error);
        return;
      }
      
      if (profiles) {
        console.log("Fetched profiles:", profiles);
        
        // Convert Supabase profiles to our User type
        const mappedUsers: User[] = profiles.map(profile => ({
          id: profile.id,
          name: profile.full_name || '',
          email: profile.email || '',
          role: profile.role as UserRole,
          title: profile.department || '',
          permissions: [],  // Initialize with empty permissions
          isApproved: profile.is_approved
        }));
        
        setUsers(mappedUsers);
        
        // Also update user permissions
        fetchUserPermissions();
      }
    } catch (error) {
      console.error("Error in fetchAllProfiles:", error);
    }
  };

  // Function to fetch user permissions
  const fetchUserPermissions = async () => {
    try {
      const { data: permissions, error } = await supabase
        .from('user_permissions')
        .select('*');
        
      if (error) {
        console.error("Error fetching user permissions:", error);
        return;
      }
      
      if (permissions && permissions.length > 0) {
        console.log("Fetched permissions:", permissions);
        
        // Update users with their permissions
        setUsers(prevUsers => {
          return prevUsers.map(user => {
            // Find all permissions for this user
            const userPermissions = permissions.filter(p => p.user_id === user.id);
            
            // Map to our UserPermission type
            const mappedPermissions: UserPermission[] = userPermissions.map(p => ({
              targetUserId: p.target_user_id,
              canView: p.can_view || false,
              canEdit: p.can_edit || false
            }));
            
            return {
              ...user,
              permissions: mappedPermissions
            };
          });
        });
      }
    } catch (error) {
      console.error("Error in fetchUserPermissions:", error);
    }
  };

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session?.user) {
          // Get the user profile from Supabase when a user logs in
          fetchUserProfile(session.user.id);
          
          // Also refresh the list of all users
          setTimeout(() => {
            fetchAllProfiles();
          }, 0);
        } else {
          setCurrentUser(null);
          localStorage.removeItem("currentUser");
        }
      }
    );

    // Check for existing session on load
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Found existing session:", session.user.id);
          fetchUserProfile(session.user.id);
        }

        // Always fetch all profiles initially
        fetchAllProfiles();
        
        // Finally, set loading to false
        setLoading(false);
      } catch (error) {
        console.error("Session check error:", error);
        setLoading(false);
      }
    };

    checkSession();

    // Set up real-time subscription for profiles table changes
    const profilesChannel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        console.log('Profiles change received!', payload);
        fetchAllProfiles(); // Refresh all profiles when changes occur
      })
      .subscribe();

    return () => {
      subscription?.unsubscribe();
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      if (profile) {
        console.log("Fetched profile:", profile);
        
        // Convert Supabase profile to our User type
        const user: User = {
          id: profile.id,
          name: profile.full_name || '',
          email: profile.email || '',
          role: profile.role as UserRole,
          title: profile.department,
          permissions: [],  // We'll implement this separately if needed
          isApproved: profile.is_approved
        };
        
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        
        // Also update the users array if this user exists there
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === user.id ? { ...u, ...user } : u
        ));
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    
    try {
      console.log("Attempting login for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        console.error("Supabase login error:", error);
        
        // Provide more specific error messages
        if (error.message === "Invalid login credentials") {
          throw new Error("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message === "Email not confirmed") {
          throw new Error("Please check your email and click the confirmation link before logging in.");
        } else {
          throw error;
        }
      } else if (data?.user) {
        console.log("Supabase login successful:", data.user);
        // The auth state change listener will handle setting the user
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // The auth state change listener will handle clearing the user state
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
      
      // Fallback: Clear state manually
      setCurrentUser(null);
      localStorage.removeItem("currentUser");
    }
  };

  const registerUser = async (email: string, password: string, fullName: string): Promise<void> => {
    console.log("Registering new user:", { email, fullName });
    
    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          },
        }
      });
      
      if (error) {
        console.error("Supabase registration error:", error);
        throw error;
      }
      
      if (data?.user) {
        console.log("Supabase registration successful:", data.user);
        
        // Wait a moment for the database trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if profile was created automatically
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError || !profile) {
            console.log("Profile not found after registration, creating manually");
            
            // If profile wasn't created automatically, create it manually
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                full_name: fullName,
                email: email,
                role: 'employee',
                is_approved: true
              });
              
            if (insertError) {
              console.error("Error creating profile manually:", insertError);
              throw insertError;
            }
          } else {
            console.log("Profile created successfully:", profile);
          }
        } catch (profileCheckError) {
          console.error("Error checking for profile:", profileCheckError);
        }
        
        // Refresh the users list to include the new user
        setTimeout(() => {
          fetchAllProfiles();
        }, 500);
        
        toast.success("Registration successful! You can now log in.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      console.log(`Updating user ${userId} role to ${role}`);
      
      // Use the safe RPC function to update role
      const { error } = await supabase.rpc('update_user_role_safe', {
        target_user_id: userId,
        new_role: role
      });

      if (error) {
        console.error("Error updating user role:", error);
        toast.error("Failed to update user role: " + error.message);
        return;
      }
      
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
      
      // Refresh all profiles to ensure consistency
      await fetchAllProfiles();
      
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error in updateUserRole:", error);
      toast.error("Failed to update user role");
    }
  };

  const updateUserTitle = (userId: string, title: string) => {
    // Update the department (title) in the Supabase database
    supabase
      .from('profiles')
      .update({ department: title === "none" ? null : title })
      .eq('id', userId)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating user title:", error);
          toast.error("Failed to update user title");
          return;
        }
        
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
        
        toast.success("User title updated successfully");
      });
  };

  const updateUserPermissions = async (userId: string, targetUserId: string, newPermissions: Partial<UserPermission>) => {
    try {
      // First check if permission already exists in the database
      const { data: existingPermission, error: fetchError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error checking for existing permission:", fetchError);
        throw fetchError;
      }
      
      let dbError;
      
      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from('user_permissions')
          .update({
            can_view: newPermissions.canView !== undefined ? newPermissions.canView : existingPermission.can_view,
            can_edit: newPermissions.canEdit !== undefined ? newPermissions.canEdit : existingPermission.can_edit,
          })
          .eq('id', existingPermission.id);
          
        dbError = error;
      } else {
        // Create new permission
        const { error } = await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            target_user_id: targetUserId,
            can_view: newPermissions.canView || false,
            can_edit: newPermissions.canEdit || false,
          });
          
        dbError = error;
      }
      
      if (dbError) {
        console.error("Error updating permissions in database:", dbError);
        toast.error("Failed to update permissions");
        return;
      }
      
      // Update local state
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
    } catch (error) {
      console.error("Error in updateUserPermissions:", error);
      toast.error("Failed to update permissions");
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
        updateUserTitle,
        updateUserRole,
        updateUserPermissions,
        canViewUser: (viewerId, targetUserId) => canViewUser(users, viewerId, targetUserId),
        canEditUser: (editorId, targetUserId) => canEditUser(users, editorId, targetUserId),
        getAccessibleUsers: (userId) => getAccessibleUsers(users, userId),
        registerUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
