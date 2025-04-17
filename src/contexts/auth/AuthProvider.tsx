
import React, { createContext, useState, useEffect } from "react";
import { User, Notification, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType } from "./types";
import { useAuthData } from "./useAuthData";
import { useNotifications } from "./useNotifications";
import { useAuthActions } from "./useAuthActions";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  
  const { notifications, fetchNotifications, markNotificationAsRead, unreadNotificationsCount } = 
    useNotifications();
  
  const { login, register, logout, resetAppData } = useAuthActions({
    setCurrentUser,
    setLoading
  });

  const { fetchUsers: fetchAllUsers } = useAuthData({
    currentUser,
    setUsers,
    setLoading
  });

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
              name: userData.full_name || "",
              email: sessionData.session.user.email || '',
              role: roleData.role as UserRole,
              avatar: userData.avatar_url || "",
              department: userData.department || ''
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
              name: userData.full_name || "",
              email: session.user.email || '',
              role: roleData.role as UserRole,
              avatar: userData.avatar_url || "",
              department: userData.department || ''
            });
            
            // Fetch notifications for the user
            fetchNotifications(session.user.id);
          }
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchNotifications]);

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
        fetchUsers: fetchAllUsers,
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
