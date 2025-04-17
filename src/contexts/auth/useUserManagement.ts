
import { User, UserRole, UserPermission } from "@/types";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

export const useUserManagement = (users: User[], refreshUsers: () => void) => {
  const updateUserTitle = async (userId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ title: title === "none" ? null : title })
        .eq('id', userId);

      if (error) throw error;
      
      refreshUsers();
      return users;
    } catch (error: any) {
      toast.error('Failed to update user title');
      console.error('Error updating user title:', error);
      return users;
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      
      refreshUsers();
      return users;
    } catch (error: any) {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
      return users;
    }
  };

  const updateUserPermissions = async (userId: string, targetUserId: string, newPermissions: Partial<UserPermission>) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          target_user_id: targetUserId,
          can_view: newPermissions.canView,
          can_edit: newPermissions.canEdit
        });

      if (error) throw error;
      
      refreshUsers();
      return users;
    } catch (error: any) {
      toast.error('Failed to update user permissions');
      console.error('Error updating user permissions:', error);
      return users;
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;
      
      refreshUsers();
    } catch (error: any) {
      toast.error('Failed to approve user');
      console.error('Error approving user:', error);
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      // Delete the auth user (this will cascade to profile due to foreign key)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;
      
      refreshUsers();
    } catch (error: any) {
      toast.error('Failed to reject user');
      console.error('Error rejecting user:', error);
    }
  };

  const getPendingUsers = () => {
    return users.filter(user => !user.isApproved);
  };

  return {
    updateUserTitle,
    updateUserRole,
    updateUserPermissions,
    approveUser,
    rejectUser,
    getPendingUsers,
  };
};
