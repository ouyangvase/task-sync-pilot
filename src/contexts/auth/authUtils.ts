
import { User } from "@/types";

export const canViewUser = (users: User[], viewerId: string, targetUserId: string): boolean => {
  const viewer = users.find(u => u.id === viewerId);
  if (!viewer) return false;
  
  if (viewer.role === "admin") return true;
  if (viewerId === targetUserId) return true;
  
  const permission = viewer.permissions?.find(p => p.targetUserId === targetUserId);
  return !!permission?.canView;
};

export const canEditUser = (users: User[], editorId: string, targetUserId: string): boolean => {
  const editor = users.find(u => u.id === editorId);
  if (!editor) return false;
  
  if (editor.role === "admin") return true;
  
  const permission = editor.permissions?.find(p => p.targetUserId === targetUserId);
  return !!permission?.canEdit;
};

export const getAccessibleUsers = (users: User[], userId: string): User[] => {
  const user = users.find(u => u.id === userId);
  if (!user) return [];
  
  if (user.role === "admin") return users.filter(u => u.isApproved !== false);
  
  const accessibleUsers = [user];
  
  users.forEach(otherUser => {
    if (otherUser.id !== userId && otherUser.isApproved !== false && canViewUser(users, userId, otherUser.id)) {
      accessibleUsers.push(otherUser);
    }
  });
  
  return accessibleUsers;
};
