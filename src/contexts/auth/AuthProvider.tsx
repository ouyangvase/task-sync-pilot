import React, { createContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthActions } from "./useAuthActions";
import { useAuthData } from "./useAuthData";
import { useNotifications } from "./useNotifications";
import { AuthContextType } from "./types";
import { User, UserRole } from "@/types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { loadUsers, users } = useAuthData({ setLoading });
  const { notifications, markNotificationAsRead, unreadNotificationsCount } = useNotifications();
  const authActions = useAuthActions({ setCurrentUser, setLoading });

  const mapUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.error("Error fetching user role:", error);
        // Fallback to employee as default role
        return "employee";
      }

      // The database schema only supports "admin", "tenant", "landlord", "merchant"
      // So we need to map accordingly
      return data.role as UserRole; 
    } catch (error) {
      console.error("Error in mapUserRole:", error);
      return "employee";
    }
  };

  const isAuthenticated = !!currentUser;

  const value: AuthContextType = {
    currentUser,
    isAuthenticated,
    loading,
    login: authActions.login,
    register: authActions.register,
    logout: authActions.logout,
    users,
    fetchUsers: loadUsers,
    resetAppData: authActions.resetAppData,
    notifications,
    markNotificationAsRead,
    unreadNotificationsCount,
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (session?.user) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const role = await mapUserRole(session.user.id);

          setCurrentUser({
            id: session.user.id,
            name: userProfile?.full_name || session.user.email?.split('@')[0] || 'Unknown User',
            email: session.user.email || '',
            role: role,
            avatar: userProfile?.avatar_url || '',
            monthlyPoints: 0,
            department: userProfile?.department || undefined,
          });

          // Load all users if current user is admin
          if (role === 'admin') {
            await loadUsers();
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          return;
        }

        if (event === "SIGNED_IN" && session?.user) {
          setLoading(true);
          
          try {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const role = await mapUserRole(session.user.id);

            setCurrentUser({
              id: session.user.id,
              name: userProfile?.full_name || session.user.email?.split('@')[0] || 'Unknown User',
              email: session.user.email || '',
              role: role,
              avatar: userProfile?.avatar_url || '',
              monthlyPoints: 0,
              department: userProfile?.department || undefined,
            });

            // Load all users if current user is admin
            if (role === 'admin') {
              await loadUsers();
            }
          } catch (error) {
            console.error("Error handling auth change:", error);
          } finally {
            setLoading(false);
          }
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import { useContext } from 'react';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
