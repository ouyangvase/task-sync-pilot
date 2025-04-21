
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
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [fetchingUsers, setFetchingUsers] = useState<boolean>(true);

  const {
    updateUserTitle,
    updateUserRole,
    updateUserPermissions,
    getPendingUsers
  } = useUserManagement(users);

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
      console.log("Fetching all users from Supabase...");
      
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
          name: profile.full_name || profile.email?.split('@')[0] || "",
          role: "employee", // Default role since it's not in profiles table
          isApproved: profile.is_approved === true,
          title: profile.department || "", // Using department as title
          permissions: [],
          avatar: profile.avatar_url || ""
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
      } else {
        // No profiles found, just use mock data
        console.log("No profiles found in database, using mock data");
      }
    } catch (error) {
      console.error("Error in fetchAllUsers:", error);
    } finally {
      setFetchingUsers(false);
    }
  };

  // Set up auth listener and initial auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Always fetch users first
        await fetchAllUsers();
        
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          // User is logged in
          const userId = sessionData.session.user.id;
          const userEmail = sessionData.session.user.email;
          
          console.log("Found existing session for user:", userEmail);
          
          // Special handling for admin
          if (userEmail === "admin@tasksync.com") {
            const adminUser = mockUsers.find(u => u.email === "admin@tasksync.com");
            if (adminUser) {
              setCurrentUser(adminUser);
              localStorage.setItem("currentUser", JSON.stringify(adminUser));
              console.log("Admin user logged in:", adminUser);
            }
          } else {
            try {
              // Try to fetch profile from Supabase
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
                
              if (profileError) {
                console.error("Error fetching profile on init:", profileError);
              } else if (profileData && profileData.is_approved) {
                // User is approved, set as current user
                const userWithProfile = {
                  id: userId,
                  email: userEmail || "",
                  name: profileData.full_name || userEmail?.split('@')[0] || "",
                  role: "employee", // Default role since it's not in profiles table
                  isApproved: profileData.is_approved === true,
                  title: profileData.department || "", // Using department as title
                  permissions: [],
                  avatar: profileData.avatar_url || ""
                };
                
                setCurrentUser(userWithProfile);
                localStorage.setItem("currentUser", JSON.stringify(userWithProfile));
              } else if (profileData && !profileData.is_approved) {
                // User not approved, log them out
                toast.error("Your account is pending approval");
                await supabase.auth.signOut();
                setCurrentUser(null);
                localStorage.removeItem("currentUser");
              } else if (!profileData) {
                // No profile found for this user
                console.error("No profile found for user", userId);
                toast.error("Account setup incomplete. Please contact admin.");
                await supabase.auth.signOut();
                setCurrentUser(null);
                localStorage.removeItem("currentUser");
              }
            } catch (error) {
              console.error("Error processing user profile:", error);
            }
          }
        } else {
          // No session, ensure user is logged out
          setCurrentUser(null);
          localStorage.removeItem("currentUser");
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Refresh user list when someone signs in
        fetchAllUsers();
      }
    });
    
    // Initialize auth
    initializeAuth();
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Wrap utility functions to match the expected signatures in AuthContextType
  const canViewUser = (viewerId: string, targetUserId: string): boolean => {
    return canViewUserUtil(users, viewerId, targetUserId);
  };

  const canEditUser = (editorId: string, targetUserId: string): boolean => {
    return canEditUserUtil(users, editorId, targetUserId);
  };

  const getAccessibleUsers = (userId: string): User[] => {
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
