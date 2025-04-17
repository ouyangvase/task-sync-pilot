
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types";

interface AuthDataProps {
  currentUser: User | null;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAuthData = ({ currentUser, setUsers, setLoading }: AuthDataProps) => {
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
            role: (userRole?.role as UserRole) || 'employee',
            avatar: profile.avatar_url,
            department: profile.department || ''
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

  return {
    fetchUsers
  };
};
