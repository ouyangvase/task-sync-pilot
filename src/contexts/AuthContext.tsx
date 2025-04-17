
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Notification } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, department?: string) => Promise<void>;
  logout: () => Promise<void>;
  users: User[];
  fetchUsers: () => Promise<void>;
  resetAppData: () => Promise<void>;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  unreadNotificationsCount: number;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Check for session on initial load
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Check if user is already logged in
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
          
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', sessionData.session.user.id)
            .single();
            
          if (userData && roleData) {
            setCurrentUser({
              id: sessionData.session.user.id,
              name: userData.full_name,
              email: sessionData.session.user.email || '',
              role: roleData.role,
              avatar: userData.avatar_url,
              // Handle the potential missing department field
              department: userData.department
            });
            
            // Fetch notifications for the user
            fetchNotifications(sessionData.session.user.id);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Fetch user data when signed in
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (userData && roleData) {
            setCurrentUser({
              id: session.user.id,
              name: userData.full_name,
              email: session.user.email || '',
              role: roleData.role,
              avatar: userData.avatar_url,
              // Handle the potential missing department field
              department: userData.department
            });
            
            // Fetch notifications for the user
            fetchNotifications(session.user.id);
          }
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          setNotifications([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Fetch notifications for a user
  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  
  // Mark a notification as read
  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (!error) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true } 
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
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
      
      toast.success("Login successful");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, department?: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            department: department || ''
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Registration successful! You can now login.");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const fetchUsers = async () => {
    try {
      if (!currentUser || currentUser.role !== 'admin') return;
      
      setLoading(true);
      
      // Get all profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (profiles && roles) {
        const mappedUsers: User[] = profiles.map(profile => {
          const userRole = roles.find(r => r.user_id === profile.id);
          return {
            id: profile.id,
            name: profile.full_name,
            email: '',
            role: userRole?.role || 'employee',
            avatar: profile.avatar_url,
            department: profile.department || '' // Safe access with default
          };
        });
        
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset app data - deleting all tasks for admin use only
  const resetAppData = async () => {
    try {
      if (!currentUser || currentUser.role !== 'admin') {
        toast.error("Only administrators can reset app data");
        return;
      }
      
      setLoading(true);
      
      // Clear local storage data
      localStorage.removeItem("tasks");
      localStorage.removeItem("rewardTiers");
      localStorage.removeItem("monthlyTarget");
      localStorage.removeItem("userPoints");
      
      // Reset any other local storage data as needed
      
      toast.success("App data has been reset successfully");
    } catch (error) {
      console.error("Error resetting app data:", error);
      toast.error("Failed to reset app data");
    } finally {
      setLoading(false);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login,
        register,
        logout,
        users,
        fetchUsers,
        resetAppData,
        notifications,
        markNotificationAsRead,
        unreadNotificationsCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
