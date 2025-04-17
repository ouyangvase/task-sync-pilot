
import { User, UserPermission, UserRole } from "@/types";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

export const useUserManagement = (users: User[], refreshUsers: () => Promise<void>) => {
  const updateUserTitle = async (userId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ title: title === "none" ? null : title })
        .eq('id', userId);

      if (error) throw error;
      
      await refreshUsers();
      return users;
    } catch (error: any) {
      toast.error('Failed to update user title');
      console.error('Error updating user title:', error);
      return users;
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      // Validate role is a valid UserRole type before updating
      const validRole = validateUserRole(role);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: validRole })
        .eq('id', userId);

      if (error) throw error;
      
      await refreshUsers();
      return users;
    } catch (error: any) {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
      return users;
    }
  };

  // Helper function to validate role is one of the allowed values
  const validateUserRole = (role: string): UserRole => {
    const validRoles: UserRole[] = ['admin', 'employee', 'team_lead', 'manager'];
    if (validRoles.includes(role as UserRole)) {
      return role as UserRole;
    }
    // Default to employee if invalid role provided
    console.warn(`Invalid role '${role}' provided, defaulting to 'employee'`);
    return 'employee';
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
      
      await refreshUsers();
    } catch (error: any) {
      toast.error('Failed to update user permissions');
      console.error('Error updating user permissions:', error);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;
      
      await refreshUsers();
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
      
      await refreshUsers();
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
