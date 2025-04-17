
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  users: User[];
  fetchUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Fetches all users from the database
  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Map profiles with roles to create User objects
      // Ensure we only use valid role values from UserRole type (admin or employee)
      const mappedUsers: User[] = profiles.map((profile: any) => {
        const userRole = userRoles.find((r: any) => r.user_id === profile.id);
        // Ensure role is either "admin" or "employee" (valid UserRole values)
        const role = userRole?.role === "admin" || userRole?.role === "employee" 
          ? userRole.role 
          : "employee"; // Default to employee if invalid role

        return {
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          role: role,
          avatar: profile.avatar_url,
          department: profile.department
        };
      });

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  // Initialize auth state
  useEffect(() => {
    const setUpAuthListener = async () => {
      try {
        // First check the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setCurrentUser(null);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_, session) => {
            if (session?.user) {
              await fetchUserData(session.user.id);
            } else {
              setCurrentUser(null);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth setup error:", error);
      } finally {
        setLoading(false);
      }
    };

    setUpAuthListener();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError) throw roleError;

      // Ensure role is valid according to UserRole type
      const role = roleData.role === "admin" || roleData.role === "employee" 
        ? roleData.role 
        : "employee"; // Default to employee if invalid role

      setCurrentUser({
        id: userId,
        name: profile.full_name || 'Unknown User',
        email: profile.email,
        role: role,
        avatar: profile.avatar_url,
        department: profile.department
      });
      
      // Fetch all users when a user logs in
      await fetchUsers();
    } catch (error) {
      console.error("Error fetching user data:", error);
      setCurrentUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      // Don't automatically log in the user after registration
      // Let them login manually after successful registration
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    } finally {
      setLoading(false);
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
        register,
        users,
        fetchUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
