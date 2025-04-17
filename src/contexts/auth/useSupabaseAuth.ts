
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
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
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
          setCurrentUser(null);
        }
      }
    );

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
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
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
          }
        }
      });

      if (error) throw error;
      
      toast.success('Registration successful. Please wait for admin approval.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const fetchUsers = async () => {
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      if (profiles) {
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
        
        setUsers(formattedUsers);
      }
    } catch (error: any) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
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
