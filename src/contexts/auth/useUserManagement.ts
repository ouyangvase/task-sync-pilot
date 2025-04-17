
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
      console.log(`Approving user with ID: ${userId}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) {
        console.error('Database error during user approval:', error);
        throw error;
      }
      
      console.log('User approved successfully');
      await refreshUsers();
    } catch (error: any) {
      console.error('Error in approveUser function:', error);
      toast.error(`Failed to approve user: ${error.message}`);
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      console.log(`Rejecting user with ID: ${userId}`);
      
      // First get the user's email for logging purposes
      const { data: userData, error: userFetchError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
        
      if (userFetchError) {
        console.error('Error fetching user data before rejection:', userFetchError);
      }
      
      // Delete from auth.users - this will cascade to profiles due to foreign key
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        console.error('Auth API error during user rejection:', error);
        throw error;
      }
      
      console.log(`User rejected and deleted successfully: ${userData?.email || userId}`);
      await refreshUsers();
    } catch (error: any) {
      console.error('Error in rejectUser function:', error);
      toast.error(`Failed to reject user: ${error.message}`);
    }
  };

  const getPendingUsers = () => {
    return users.filter(user => user.isApproved === false);
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
