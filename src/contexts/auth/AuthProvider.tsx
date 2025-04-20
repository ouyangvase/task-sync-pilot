
import React, { createContext, useEffect, useState } from "react";
import { mockUsers } from "@/data/mockData";
import { AuthContextType } from "./types";
import { canViewUser as canViewUserUtil, canEditUser as canEditUserUtil, getAccessibleUsers as getAccessibleUsersUtil } from "./authUtils";
import { useUserManagement } from "./useUserManagement";
import { useAuthOperations } from "./useAuthOperations";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedUsers = localStorage.getItem("users");
  const initialUsers = storedUsers ? JSON.parse(storedUsers) : mockUsers;
  const [fetchingUsers, setFetchingUsers] = useState<boolean>(true);

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

  // Fetch all users from Supabase when the auth state changes
  const fetchAllUsers = async () => {
    try {
      setFetchingUsers(true);
      // Get all profiles (both approved and pending)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return;
      }
      
      if (profilesData && profilesData.length > 0) {
        console.log("Fetched profiles from Supabase:", profilesData);
        
        // Convert profiles to User objects
        const dbUsers: User[] = profilesData.map(profile => ({
          id: profile.id,
          email: profile.email || "",
          name: profile.name || "",
          role: profile.role,
          isApproved: profile.is_approved,
          title: profile.title || "",
          permissions: [],
          avatar: profile.avatar || ""
        }));
        
        // Merge with mock users to ensure we always have the admin
        const mockAdmins = mockUsers.filter(user => user.role === "admin");
        const combinedUsers = [...dbUsers, ...mockAdmins];
        
        // Remove duplicates based on email
        const uniqueUsers = combinedUsers.filter((user, index, self) =>
          index === self.findIndex((u) => u.email === user.email)
        );
        
        setUsers(uniqueUsers);
        localStorage.setItem("users", JSON.stringify(uniqueUsers));
        console.log("Updated users after fetch:", uniqueUsers);
      }
    } catch (error) {
      console.error("Error in fetchAllUsers:", error);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profileError) {
              console.error("Error fetching profile:", profileError);
              return;
            }
            
            if (profileData.is_approved === false) {
              console.log("User not approved:", session.user.email);
              await supabase.auth.signOut();
              setCurrentUser(null);
              localStorage.removeItem("currentUser");
              return;
            }
            
            const userWithProfile = {
              id: session.user.id,
              email: session.user.email || "",
              name: profileData.name || session.user.email?.split('@')[0] || "",
              role: profileData.role,
              isApproved: profileData.is_approved,
              title: profileData.title || "",
              permissions: [],
              avatar: profileData.avatar || ""
            };
            
            setCurrentUser(userWithProfile);
            localStorage.setItem("currentUser", JSON.stringify(userWithProfile));
            
            // Refetch all users
            fetchAllUsers();
          } catch (error) {
            console.error("Error processing signed in user:", error);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem("currentUser");
        }
      }
    );
    
    // Initial setup - check session and fetch users
    const initialSetup = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching initial profile:", profileError);
            setLoading(false);
            return;
          }
          
          if (profileData.is_approved === false) {
            console.log("User not approved on initial load:", sessionData.session.user.email);
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
          
          const userWithProfile = {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email || "",
            name: profileData.name || sessionData.session.user.email?.split('@')[0] || "",
            role: profileData.role,
            isApproved: profileData.is_approved,
            title: profileData.title || "",
            permissions: [],
            avatar: profileData.avatar || ""
          };
          
          setCurrentUser(userWithProfile);
          localStorage.setItem("currentUser", JSON.stringify(userWithProfile));
        } catch (error) {
          console.error("Error processing initial user:", error);
        }
      }
      
      // Always fetch all users on initial load
      await fetchAllUsers();
      setLoading(false);
    };
    
    initialSetup();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("Current users in AuthProvider:", users);
  }, [users]);

  const handleUpdateUserPermissions = (userId: string, targetUserId: string, newPermissions: Partial<any>) => {
    const updatedUsers = updateUserPermissions(userId, targetUserId, newPermissions);
    
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
    
    return updatedUsers;
  };

  const handleUpdateUserTitle = (userId: string, title: string) => {
    const updatedUsers = updateUserTitle(userId, title);
    
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, title: title === "none" ? "" : title };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    
    return updatedUsers;
  };

  const handleUpdateUserRole = (userId: string, role: string) => {
    const updatedUsers = updateUserRole(userId, role);
    
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, role: role as any };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    
    return updatedUsers;
  };

  // Wrap utility functions to match the expected signatures in AuthContextType
  const canViewUser = (viewerId: string, targetUserId: string): boolean => {
    return canViewUserUtil(users, viewerId, targetUserId);
  };

  const canEditUser = (editorId: string, targetUserId: string): boolean => {
    return canEditUserUtil(users, editorId, targetUserId);
  };

  const getAccessibleUsers = (userId: string): any[] => {
    return getAccessibleUsersUtil(users, userId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading: loading || fetchingUsers,
        login,
        logout,
        users,
        setUsers,
        updateUserTitle,
        updateUserRole,
        updateUserPermissions,
        canViewUser,
        canEditUser,
        getAccessibleUsers,
        registerUser,
        approveUser,
        rejectUser,
        getPendingUsers,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
