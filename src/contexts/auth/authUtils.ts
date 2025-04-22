
import { User, UserRole, UserPermission } from "@/types";
import { rolePermissions } from "@/components/employees/employee-details/role-permissions/constants";

// Check if a user can view another user
export const canViewUser = (users: User[], viewerId: string, targetUserId: string): boolean => {
  const viewer = users?.find(u => u.id === viewerId);
  if (!viewer) return false;
  
  // Users can always view themselves
  if (viewerId === targetUserId) return true;
  
  // Admins can view everyone
  if (viewer.role === "admin") return true;

  // Get target user
  const target = users?.find(u => u.id === targetUserId);
  if (!target) return false;
  
  // Manager can view team leads and employees
  if (viewer.role === "manager" && 
    (target.role === "team_lead" || target.role === "employee")) {
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
  const editor = users?.find(u => u.id === editorId);
  if (!editor) return false;
  
  // Get target user
  const target = users?.find(u => u.id === targetUserId);
  if (!target) return false;
  
  // Admins can edit everyone except other admins (unless it's themselves)
  if (editor.role === "admin") {
    return target.role !== "admin" || editor.id === target.id;
  }
  
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
  if (user.role === "admin") {
    return users.filter(u => u.id !== userId);
  }
  
  // Everyone can see themselves
  const accessibleUsers = [user];
  
  // Role-based access
  users.forEach(otherUser => {
    // Skip self and admins
    if (otherUser.id === userId || otherUser.role === "admin") return;
    
    // Managers can see team leads and employees
    if (user.role === "manager") {
      if (otherUser.role === "team_lead" || otherUser.role === "employee") {
        accessibleUsers.push(otherUser);
      }
    }
    // Team leads can see employees
    else if (user.role === "team_lead") {
      if (otherUser.role === "employee") {
        accessibleUsers.push(otherUser);
      }
    }
    
    // Check specific permissions
    const permission = user.permissions?.find(p => p.targetUserId === otherUser.id);
    if (permission?.canView && !accessibleUsers.includes(otherUser)) {
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
