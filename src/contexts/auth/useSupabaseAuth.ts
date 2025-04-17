
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, UserPermission } from '@/types';
import { toast } from 'sonner';

export const useSupabaseAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session?.user) {
          // Fetch profile data for this user
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
            if (error.code !== "PGRST116") { // Not found
              setCurrentUser(null);
              return;
            }
          }

          if (profile) {
            // Check if user is approved
            if (profile.is_approved !== true) {
              console.log("User is not approved:", profile.email);
              // Sign the user out if they're not approved
              await supabase.auth.signOut();
              toast.error("Your account is pending approval by an administrator");
              setCurrentUser(null);
              return;
            }
            
            // User is approved, set current user
            setCurrentUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              avatar: profile.avatar,
              monthlyPoints: profile.monthly_points,
              title: profile.title,
              isApproved: profile.is_approved,
              permissions: []
            });
          } else {
            // No profile found, sign out
            console.log("No profile found for user, signing out:", session.user.id);
            await supabase.auth.signOut();
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    );

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile on init:", error);
          setCurrentUser(null);
        } else if (profile) {
          // Check if user is approved
          if (profile.is_approved !== true) {
            console.log("User is not approved on init:", profile.email);
            await supabase.auth.signOut();
            setCurrentUser(null);
          } else {
            setCurrentUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              avatar: profile.avatar,
              monthlyPoints: profile.monthly_points,
              title: profile.title,
              isApproved: profile.is_approved,
              permissions: []
            });
          }
        } else {
          // No profile found, sign out
          console.log("No profile found for user on init, signing out");
          await supabase.auth.signOut();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // First check if user is approved
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('email', email)
        .single();
      
      if (profileCheck && profileCheck.is_approved !== true) {
        throw new Error("Your account is pending approval by an administrator");
      }
      
      // Attempt login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const registerUser = async (email: string, password: string, fullName: string) => {
    try {
      console.log(`Attempting to register user: ${email}, name: ${fullName}`);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
          }
        }
      });

      if (error) {
        console.error("Registration error:", error);
        throw error;
      }
      
      console.log("Registration successful:", data);
      toast.success('Registration successful. Please wait for admin approval.');
      
      // Sign out immediately after registration (user needs approval first)
      await supabase.auth.signOut();
      
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error.message);
      throw error;
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("Fetching all users");
      
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      if (profiles) {
        console.log(`Found ${profiles.length} user profiles`);
        
        // Then get all permissions separately
        const { data: permissions, error: permissionsError } = await supabase
          .from('user_permissions')
          .select('*');

        if (permissionsError) {
          console.error('Error fetching permissions:', permissionsError);
          // Continue without permissions rather than failing completely
        }

        // Format the permissions correctly
        const formattedUsers: User[] = profiles.map(profile => {
          // Filter permissions for this user
          const userPermissions: UserPermission[] = permissions 
            ? permissions
                .filter(p => p.user_id === profile.id)
                .map(p => ({
                  targetUserId: p.target_user_id || '',
                  canView: !!p.can_view,
                  canEdit: !!p.can_edit
                }))
            : [];
          
          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            avatar: profile.avatar || '',
            monthlyPoints: profile.monthly_points || 0,
            title: profile.title || undefined,
            isApproved: !!profile.is_approved,
            permissions: userPermissions
          };
        });
        
        console.log(`Processed ${formattedUsers.length} formatted users`);
        setUsers(formattedUsers);
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    currentUser,
    loading,
    login,
    logout,
    registerUser,
    users,
    setUsers: fetchUsers
  };
};
