import React, { createContext, useEffect, useState } from "react";
import { mockUsers } from "@/data/mockData";
import { AuthContextType } from "./types";
import { canViewUser as canViewUserUtil, canEditUser as canEditUserUtil, getAccessibleUsers as getAccessibleUsersUtil } from "./authUtils";
import { useUserManagement } from "./useUserManagement";
import { useAuthOperations } from "./useAuthOperations";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types";
import { toast } from "sonner";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedUsers = localStorage.getItem("users");
  const initialUsers = storedUsers ? JSON.parse(storedUsers) : mockUsers;
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [fetchingUsers, setFetchingUsers] = useState<boolean>(true);

  const {
    updateUserTitle,
    updateUserRole: userManagementUpdateUserRole,
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

  const updateUserRole = (userId: string, role: UserRole | string) => {
    console.log(`AuthProvider: Updating role for ${userId} to ${role}`);
    
    // Update roles in user management hook
    const updatedUsers = userManagementUpdateUserRole(userId, role);
    
    // If the current user is being updated, update the current user as well
    if (currentUser && currentUser.id === userId) {
      const updatedCurrentUser = { ...currentUser, role: role as UserRole };
      setCurrentUser(updatedCurrentUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));
      console.log("Updated current user role:", updatedCurrentUser);
    }
    
    return updatedUsers;
  };

  const fetchAllUsers = async () => {
    try {
      setFetchingUsers(true);
      console.log("Fetching all users from Supabase...");
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return;
      }
      
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
      }
      
      const userRolesMap: Record<string, string> = {};
      if (rolesData && rolesData.length > 0) {
        rolesData.forEach((roleEntry: any) => {
          userRolesMap[roleEntry.user_id] = roleEntry.role;
        });
      }
      
      if (profilesData && profilesData.length > 0) {
        console.log("Fetched profiles from Supabase:", profilesData);
        
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('user_permissions')
          .select('*');
          
        const permissionsMap: Record<string, any[]> = {};
        if (permissionsData && !permissionsError) {
          permissionsData.forEach(perm => {
            if (!permissionsMap[perm.user_id]) {
              permissionsMap[perm.user_id] = [];
            }
            permissionsMap[perm.user_id].push({
              targetUserId: perm.target_user_id,
              canView: perm.can_view,
              canEdit: perm.can_edit
            });
          });
        } else if (permissionsError) {
          console.error("Error fetching permissions:", permissionsError);
        }
        
        const dbUsers: User[] = profilesData.map((profile: any) => {
          const userRole = userRolesMap[profile.id] || profile.role || "employee";
          
          return {
            id: profile.id,
            email: profile.email || "",
            name: profile.full_name || profile.email?.split('@')[0] || "",
            role: userRole as UserRole,
            isApproved: profile.is_approved === true,
            title: profile.department || "",
            permissions: permissionsMap[profile.id] || [],
            avatar: profile.avatar_url || ""
          };
        });
        
        const mockAdmins = mockUsers.filter(user => user.role === "admin");
        const combinedUsers = [...dbUsers, ...mockAdmins];
        
        const uniqueUsers = combinedUsers.filter((user, index, self) =>
          index === self.findIndex((u) => u.email === user.email)
        );
        
        setUsers(uniqueUsers);
        localStorage.setItem("users", JSON.stringify(uniqueUsers));
        console.log("Updated users after fetch:", uniqueUsers);
      } else {
        console.log("No profiles found in database, using mock data");
      }
    } catch (error) {
      console.error("Error in fetchAllUsers:", error);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        await fetchAllUsers();
        
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          const userId = sessionData.session.user.id;
          const userEmail = sessionData.session.user.email;
          
          console.log("Found existing session for user:", userEmail);
          
          if (userEmail === "admin@tasksync.com") {
            const adminUser = mockUsers.find(u => u.email === "admin@tasksync.com");
            if (adminUser) {
              setCurrentUser(adminUser);
              localStorage.setItem("currentUser", JSON.stringify(adminUser));
              console.log("Admin user logged in:", adminUser);
            }
          } else {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
                
              if (profileData) {
                const { data: permissionsData } = await supabase
                  .from('user_permissions')
                  .select('*')
                  .eq('user_id', userId);
                  
                const permissions = (permissionsData || []).map(perm => ({
                  targetUserId: perm.target_user_id,
                  canView: perm.can_view,
                  canEdit: perm.can_edit
                }));
                
                const userWithProfile: User = {
                  id: userId,
                  email: userEmail || "",
                  name: profileData.full_name || userEmail?.split('@')[0] || "",
                  role: (profileData.role as UserRole) || "employee",
                  isApproved: true,
                  title: profileData.department || "",
                  permissions: permissions,
                  avatar: profileData.avatar_url || ""
                };
                
                setCurrentUser(userWithProfile);
                localStorage.setItem("currentUser", JSON.stringify(userWithProfile));
                console.log("Logged in user with permissions:", userWithProfile);
              } else {
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
          setCurrentUser(null);
          localStorage.removeItem("currentUser");
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
      } else if (event === 'SIGNED_IN' && session?.user) {
        fetchAllUsers();
      }
    });
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const canViewUser = (viewerId: string, targetUserId: string): boolean => {
    return canViewUserUtil(users, viewerId, targetUserId);
  };

  const canEditUser = (editorId: string, targetUserId: string): boolean => {
    return canEditUserUtil(users, editorId, targetUserId);
  };

  const getAccessibleUsers = (userId: string): User[] => {
    return getAccessibleUsersUtil(users, userId);
  };

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles' }, 
        (payload) => {
          console.log('Profile updated:', payload);
          fetchAllUsers(); // Refresh all users
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        (payload) => {
          console.log('User role changed:', payload);
          fetchAllUsers(); // Refresh all users
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_permissions' },
        (payload) => {
          console.log('User permission changed:', payload);
          fetchAllUsers(); // Refresh all users
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

export default AuthProvider;
