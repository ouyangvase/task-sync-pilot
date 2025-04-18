
import React, { createContext, useEffect } from "react";
import { mockUsers, currentUser as mockCurrentUser } from "@/data/mockData";
import { AuthContextType } from "./types";
import { canViewUser, canEditUser, getAccessibleUsers } from "./authUtils";
import { useUserManagement } from "./useUserManagement";
import { useAuthOperations } from "./useAuthOperations";
import { supabase } from "@/integrations/supabase/client";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users from localStorage if available
  const storedUsers = localStorage.getItem("users");
  const initialUsers = storedUsers ? JSON.parse(storedUsers) : mockUsers;

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

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Get user profile data
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
          } catch (error) {
            console.error("Error processing signed in user:", error);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem("currentUser");
        }
      }
    );
    
    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Handle in a separate function to avoid duplication
        const fetchUserProfile = async () => {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profileError) {
              console.error("Error fetching initial profile:", profileError);
              setLoading(false);
              return;
            }
            
            if (profileData.is_approved === false) {
              console.log("User not approved on initial load:", session.user.email);
              setLoading(false);
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
          } catch (error) {
            console.error("Error processing initial user:", error);
          } finally {
            setLoading(false);
          }
        };
        
        fetchUserProfile();
      } else {
        // Check for saved user in localStorage as fallback for development
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setCurrentUser({
              ...parsedUser,
              permissions: parsedUser.permissions || []
            });
          } catch (error) {
            console.error("Error parsing saved user:", error);
            localStorage.removeItem("currentUser");
          }
        } else if (process.env.NODE_ENV === 'development') {
          // For demo purposes, auto-login as the mock user in development only
          const enhancedUser = {
            ...mockCurrentUser,
            permissions: mockCurrentUser.permissions || []
          };
          setCurrentUser(enhancedUser);
          localStorage.setItem("currentUser", JSON.stringify(enhancedUser));
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Debug users list
  useEffect(() => {
    console.log("Current users in AuthProvider:", users);
  }, [users]);

  // Sync currentUser when user permissions change
  const handleUpdateUserPermissions = (userId: string, targetUserId: string, newPermissions: Partial<any>) => {
    const updatedUsers = updateUserPermissions(userId, targetUserId, newPermissions);
    
    // Update currentUser if it's the same user
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
  };

  // Sync currentUser when user title changes
  const handleUpdateUserTitle = (userId: string, title: string) => {
    const updatedUsers = updateUserTitle(userId, title);
    
    // Update currentUser if it's the same user
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, title: title === "none" ? "" : title };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    
    // Return the updatedUsers array to satisfy the type requirement
    return updatedUsers;
  };

  // Sync currentUser when user role changes
  const handleUpdateUserRole = (userId: string, role: string) => {
    const updatedUsers = updateUserRole(userId, role);
    
    // Update currentUser if it's the same user
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, role: role as any };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    
    // Return the updatedUsers array to satisfy the type requirement
    return updatedUsers;
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
        setUsers, // Make setUsers available in the context
        updateUserTitle: handleUpdateUserTitle,
        updateUserRole: handleUpdateUserRole,
        updateUserPermissions: handleUpdateUserPermissions,
        canViewUser: (viewerId, targetUserId) => canViewUser(users, viewerId, targetUserId),
        canEditUser: (editorId, targetUserId) => canEditUser(users, editorId, targetUserId),
        getAccessibleUsers: (userId) => getAccessibleUsers(users, userId),
        registerUser,
        approveUser,
        rejectUser,
        getPendingUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
