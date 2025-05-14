
import { User, UserRole, UserPermission } from "@/types";

// Check if a user can view another user
export const canViewUser = (users: User[], viewerId: string, targetUserId: string): boolean => {
  // Admins can view everyone
  const viewer = users.find(u => u.id === viewerId);
  if (!viewer) return false;
  
  if (viewer.role === "admin") return true;
  
  // Users can always view themselves
  if (viewerId === targetUserId) return true;
  
  // Check specific permissions
  const permission = viewer.permissions?.find(p => p.targetUserId === targetUserId);
  return !!permission?.canView;
};

// Check if a user can edit another user
export const canEditUser = (users: User[], editorId: string, targetUserId: string): boolean => {
  // Admins can edit everyone
  const editor = users.find(u => u.id === editorId);
  if (!editor) return false;
  
  if (editor.role === "admin") return true;
  
  // Check specific permissions
  const permission = editor.permissions?.find(p => p.targetUserId === targetUserId);
  return !!permission?.canEdit;
};

// Get all users that can be viewed by a specific user
export const getAccessibleUsers = (users: User[], userId: string): User[] => {
  const user = users.find(u => u.id === userId);
  if (!user) return [];
  
  // Admins can see everyone
  if (user.role === "admin") return users.filter(u => u.isApproved !== false);
  
  // Everyone can see themselves
  const accessibleUsers = [user];
  
  // Add users with specific view permissions
  users.forEach(otherUser => {
    if (otherUser.id !== userId && otherUser.isApproved !== false && canViewUser(users, userId, otherUser.id)) {
      accessibleUsers.push(otherUser);
    }
  });
  
  return accessibleUsers;
};

// Update user permissions helper
export const updateUserPermissionsHelper = (
  users: User[],
  userId: string, 
  targetUserId: string, 
  newPermissions: Partial<UserPermission>
): User[] => {
  return users.map(user => {
    if (user.id === userId) {
      const permissions = [...(user.permissions || [])];
      
      // Find existing permission for this target user
      const existingPermIndex = permissions.findIndex(p => p.targetUserId === targetUserId);
      
      if (existingPermIndex >= 0) {
        // Update existing permission
        permissions[existingPermIndex] = {
          ...permissions[existingPermIndex],
          ...newPermissions
        };
      } else {
        // Create new permission
        permissions.push({
          targetUserId,
          canView: newPermissions.canView || false,
          canEdit: newPermissions.canEdit || false
        });
      }
      
      return { ...user, permissions };
    }
    return user;
  });
};
