
import { User, UserRole, UserPermission } from "@/types";
import { rolePermissions } from "@/components/employees/employee-details/role-permissions/constants";

// Check if a user can view another user
export const canViewUser = (users: User[], viewerId: string, targetUserId: string): boolean => {
  // Admins can view everyone
  const viewer = users?.find(u => u.id === viewerId);
  if (!viewer) return false;
  
  if (viewer.role === "admin") return true;
  
  // Users can always view themselves
  if (viewerId === targetUserId) return true;
  
  // Role-based viewing permissions
  const target = users?.find(u => u.id === targetUserId);
  if (!target) return false;

  // Manager can view team leads and employees
  if (viewer.role === "manager" && (target.role === "team_lead" || target.role === "employee")) {
    return true;
  }
  
  // Team lead can view employees
  if (viewer.role === "team_lead" && target.role === "employee") {
    return true;
  }
  
  // Check specific permissions
  const permission = viewer.permissions?.find(p => p.targetUserId === targetUserId);
  return !!permission?.canView;
};

// Check if a user can edit another user
export const canEditUser = (users: User[], editorId: string, targetUserId: string): boolean => {
  // Admins can edit everyone
  const editor = users?.find(u => u.id === editorId);
  if (!editor) return false;
  
  if (editor.role === "admin") return true;
  
  // No one can edit admins except other admins
  const target = users?.find(u => u.id === targetUserId);
  if (!target) return false;
  
  // Handle admin target case separately to avoid type comparison error
  if (target.role === "admin") {
    return false; // Non-admin users can't edit admins
  }
  
  // Role-based editing permissions
  // Manager can edit team leads and employees
  if (editor.role === "manager") {
    return target.role === "team_lead" || target.role === "employee";
  }
  
  // Team lead can edit employees
  if (editor.role === "team_lead") {
    return target.role === "employee";
  }
  
  // Check specific permissions
  const permission = editor.permissions?.find(p => p.targetUserId === targetUserId);
  return !!permission?.canEdit;
};

// Get all users that can be viewed by a specific user
export const getAccessibleUsers = (users: User[], userId: string): User[] => {
  if (!users || !Array.isArray(users)) {
    console.error("Invalid users array:", users);
    return [];
  }

  const user = users.find(u => u.id === userId);
  if (!user) return [];
  
  // Admins can see everyone
  if (user.role === "admin") return users;
  
  // Everyone can see themselves
  const accessibleUsers = [user];
  
  // Role-based access
  if (user.role === "manager") {
    // Managers can see team leads and employees
    users.forEach(otherUser => {
      if ((otherUser.role === "team_lead" || otherUser.role === "employee") && otherUser.id !== userId) {
        accessibleUsers.push(otherUser);
      }
    });
  } else if (user.role === "team_lead") {
    // Team leads can see employees
    users.forEach(otherUser => {
      if (otherUser.role === "employee" && otherUser.id !== userId) {
        accessibleUsers.push(otherUser);
      }
    });
  }
  
  // Add users with specific view permissions
  users.forEach(otherUser => {
    if (otherUser.id !== userId && !accessibleUsers.includes(otherUser)) {
      const permission = user.permissions?.find(p => p.targetUserId === otherUser.id);
      if (permission?.canView) {
        accessibleUsers.push(otherUser);
      }
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
