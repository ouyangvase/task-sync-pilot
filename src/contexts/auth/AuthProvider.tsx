import React, { createContext, useState, useEffect } from "react";
import { User, UserRole, UserPermission } from "@/types";
import { mockUsers, currentUser as mockCurrentUser } from "@/data/mockData";
import { toast } from "sonner";
import { AuthContextType } from "./types";
import { canViewUser, canEditUser, getAccessibleUsers, updateUserPermissionsHelper } from "./authUtils";
import { supabase } from "@/integrations/supabase/client";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(
    // Initialize with empty permissions arrays if not already present
    mockUsers.map(user => ({
      ...user,
      permissions: user.permissions || [],
      isApproved: true, // All users are automatically approved now
    }))
  );

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session?.user) {
          // Get the user profile from Supabase when a user logs in
          fetchUserProfile(session.user.id);
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
        } else {
          // For demo purposes, if no session exists, use mock data
          const savedUser = localStorage.getItem("currentUser");
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setCurrentUser({
              ...parsedUser,
              permissions: parsedUser.permissions || []
            });
          } else {
            // Auto-login as mock user in development
            const enhancedUser = {
              ...mockCurrentUser,
              permissions: mockCurrentUser.permissions || []
            };
            setCurrentUser(enhancedUser);
            localStorage.setItem("currentUser", JSON.stringify(enhancedUser));
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Session check error:", error);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription?.unsubscribe();
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
      
      // Try to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        console.error("Supabase login error:", error);
        
        // Fall back to mock login if Supabase fails
        fallbackMockLogin(email);
      } else if (data?.user) {
        console.log("Supabase login successful:", data.user);
        // The auth state change listener will handle setting the user
      }
    } catch (error) {
      console.error("Login error:", error);
      // Fall back to mock login if Supabase throws
      fallbackMockLogin(email);
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback to mock login for development
  const fallbackMockLogin = (email: string) => {
    console.log("Falling back to mock login");
    const user = users.find((u) => u.email === email);
      
    if (!user) {
      console.log("User not found:", email);
      throw new Error("Invalid email or password");
    }
    
    console.log("Found user:", user);
    
    const enhancedUser = {
      ...user,
      permissions: user.permissions || []
    };
    
    setCurrentUser(enhancedUser);
    localStorage.setItem("currentUser", JSON.stringify(enhancedUser));
    
    console.log("Mock login successful:", enhancedUser);
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
    // Check if email already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

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
        
        // The database trigger will create the profile, but let's ensure it exists
        // by adding a small delay and checking for it
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
            }
          } else {
            console.log("Profile created successfully:", profile);
          }
        } catch (profileCheckError) {
          console.error("Error checking for profile:", profileCheckError);
        }
        
        // Also update our local state
        const newUser: User = {
          id: data.user.id,
          email,
          name: fullName,
          role: "employee", // Default role
          isApproved: true, // All users are automatically approved
          permissions: [],
        };
        
        setUsers(prevUsers => [...prevUsers, newUser]);
        
        toast.success("Registration successful! You can now log in.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Keep only the user role update functionality, no need for approval methods
  const updateUserRole = (userId: string, role: string) => {
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
  };

  const updateUserTitle = (userId: string, title: string) => {
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
  };

  const updateUserPermissions = (userId: string, targetUserId: string, newPermissions: Partial<UserPermission>) => {
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
