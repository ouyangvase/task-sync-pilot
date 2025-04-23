import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, UserPermission } from "@/types";
import { useAuth } from "@/contexts/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, UserCheck, ShieldOff, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { rolePermissions } from "./role-permissions/constants";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserAccessControlProps {
  employee: User;
}

export function UserAccessControl({ employee }: UserAccessControlProps) {
  const { users, updateUserPermissions, currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [permissionsMap, setPermissionsMap] = useState<Record<string, {canView: boolean, canEdit: boolean}>>({});
  
  // Check permissions for managing user access
  const isAdmin = currentUser?.role === "admin";
  const userRole = currentUser?.role || "employee";
  const userPermissions = rolePermissions[userRole] || [];
  const canManageUsers = isAdmin || userPermissions.includes("manage_users");
  
  if (!canManageUsers) return null;
  
  // Get all other users except current, admin users,
  // and users with higher role than the employee being edited
  const otherUsers = users.filter(user => 
    user.id !== employee.id && 
    (isAdmin || user.role !== "admin") && // Only admins can manage other admins
    // Don't allow giving permissions to manage users with higher roles
    getRolePriority(user.role) <= getRolePriority(employee.role)
  );
  
  // Initialize permissions map from employee.permissions
  useEffect(() => {
    if (employee.permissions) {
      const initialPermissions: Record<string, {canView: boolean, canEdit: boolean}> = {};
      employee.permissions.forEach(permission => {
        initialPermissions[permission.targetUserId] = {
          canView: permission.canView,
          canEdit: permission.canEdit
        };
      });
      setPermissionsMap(initialPermissions);
    }
  }, [employee.permissions]);

  // Fetch current permissions from Supabase if the employee is a real user
  useEffect(() => {
    const fetchPermissions = async () => {
      if (employee.id && !employee.id.includes('user_')) {
        try {
          setLoadingUsers(true);
          const { data, error } = await supabase
            .from('user_permissions')
            .select('*')
            .eq('user_id', employee.id);
            
          if (error) {
            console.error("Error fetching user permissions:", error);
            toast.error("Failed to load user permissions");
            return;
          }
          
          if (data && data.length > 0) {
            const dbPermissions: Record<string, {canView: boolean, canEdit: boolean}> = {};
            data.forEach(perm => {
              dbPermissions[perm.target_user_id] = {
                canView: perm.can_view,
                canEdit: perm.can_edit
              };
            });
            setPermissionsMap(dbPermissions);
          }
        } catch (error) {
          console.error("Error in fetchPermissions:", error);
        } finally {
          setLoadingUsers(false);
        }
      }
    };
    
    if (isAdmin && isEditing) {
      fetchPermissions();
    }
  }, [employee.id, isAdmin, isEditing]);
  
  const handlePermissionChange = async (targetUserId: string, permType: "canView" | "canEdit", value: boolean) => {
    setSaving(true);
    try {
      // Update local permissions map first
      const updatedMap = { ...permissionsMap };
      
      // Initialize target user permission if it doesn't exist
      if (!updatedMap[targetUserId]) {
        updatedMap[targetUserId] = { canView: false, canEdit: false };
      }
      
      // Update the specific permission
      updatedMap[targetUserId][permType] = value;
      
      // If turning off "canView", also turn off "canEdit"
      if (permType === "canView" && !value && updatedMap[targetUserId].canEdit) {
        updatedMap[targetUserId].canEdit = false;
      }
      
      // If turning on "canEdit", ensure "canView" is also on
      if (permType === "canEdit" && value && !updatedMap[targetUserId].canView) {
        updatedMap[targetUserId].canView = true;
      }
      
      // Update local state
      setPermissionsMap(updatedMap);
      
      // Prepare the new permission object for our context function
      const newPermissions: Partial<UserPermission> = {
        [permType]: value
      };
      
      // If we're turning on "canEdit", ensure "canView" is also on
      if (permType === "canEdit" && value) {
        newPermissions.canView = true;
      }
      
      // If turning off "canView", also turn off "canEdit"
      if (permType === "canView" && !value) {
        newPermissions.canEdit = false;
      }
      
      // Update the user permissions in state
      const updatedUsers = updateUserPermissions(employee.id, targetUserId, newPermissions);
      
      // Store permissions in Supabase if the employee has a real DB ID
      if (employee.id && !employee.id.includes('user_')) {
        try {
          // Check if permission record already exists
          const { data: existingData } = await supabase
            .from('user_permissions')
            .select('*')
            .eq('user_id', employee.id)
            .eq('target_user_id', targetUserId)
            .maybeSingle();
          
          if (existingData) {
            // Update existing permission
            await supabase
              .from('user_permissions')
              .update({
                can_view: updatedMap[targetUserId].canView,
                can_edit: updatedMap[targetUserId].canEdit
              })
              .eq('user_id', employee.id)
              .eq('target_user_id', targetUserId);
          } else {
            // Create new permission
            await supabase
              .from('user_permissions')
              .insert({
                user_id: employee.id,
                target_user_id: targetUserId,
                can_view: updatedMap[targetUserId].canView,
                can_edit: updatedMap[targetUserId].canEdit
              });
          }
        } catch (dbError) {
          console.error("Failed to update permissions in database:", dbError);
          toast.error("Failed to update permissions in database");
        }
      }
      
      setHasChanges(true);
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };
  
  const getUserPermission = (targetUserId: string): { canView: boolean, canEdit: boolean } => {
    return permissionsMap[targetUserId] || { canView: false, canEdit: false };
  };
  
  if (otherUsers.length === 0) {
    return null;
  }
  
  if (loadingUsers) {
    return (
      <Card className="mt-6">
        <CardContent className="flex items-center justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading user permissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            User Access Control
          </CardTitle>
          <CardDescription>
            Manage which employees this user can view or edit
          </CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit Access
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setIsEditing(false);
                setHasChanges(false);
              }}
              disabled={saving}
            >
              Done
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {otherUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No other employees to manage permissions for
          </p>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-4">
              {otherUsers.map((user) => {
                const userPerm = getUserPermission(user.id);
                
                return (
                  <div key={user.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="rounded-full w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium">{user.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.role}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`view-${user.id}`}
                            checked={userPerm.canView}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(user.id, "canView", !!checked)
                            }
                            disabled={!isEditing || saving}
                          />
                          <Label 
                            htmlFor={`view-${user.id}`}
                            className={(!isEditing || saving) ? "text-muted-foreground" : ""}
                          >
                            View
                          </Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`edit-${user.id}`}
                            checked={userPerm.canEdit}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(user.id, "canEdit", !!checked)
                            }
                            disabled={!isEditing || !userPerm.canView || saving}
                          />
                          <Label 
                            htmlFor={`edit-${user.id}`}
                            className={(!isEditing || !userPerm.canView || saving) ? "text-muted-foreground" : ""}
                          >
                            Edit
                          </Label>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to determine role priority
function getRolePriority(role: string): number {
  switch (role) {
    case "admin": return 4;
    case "manager": return 3;
    case "team_lead": return 2;
    case "employee": return 1;
    default: return 0;
  }
}
