
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, UserPermission } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, UserCheck, ShieldOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { rolePermissions } from "./role-permissions/constants";

interface UserAccessControlProps {
  employee: User;
}

export function UserAccessControl({ employee }: UserAccessControlProps) {
  const { users, updateUserPermissions, currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Check permissions for managing user access
  const isAdmin = currentUser?.role === "admin";
  const userRole = currentUser?.role || "employee";
  const userPermissions = rolePermissions[userRole] || [];
  const canManageUsers = isAdmin || userPermissions.includes("manage_users");
  
  if (!canManageUsers) return null;
  
  // Get all other users except current and admin users
  const otherUsers = users.filter(user => 
    user.id !== employee.id && user.role !== "admin"
  );
  
  // Get permissions for this employee
  const employeePermissions = employee.permissions || [];
  
  const handlePermissionChange = (targetUserId: string, permType: "canView" | "canEdit", value: boolean) => {
    // Find existing permission for this target user
    const existingPerm = employeePermissions.find(p => p.targetUserId === targetUserId);
    
    // Prepare the new permission state
    const newPermissions: Partial<UserPermission> = {
      [permType]: value
    };
    
    // If editing "canEdit", make sure "canView" is also enabled
    if (permType === "canEdit" && value) {
      newPermissions.canView = true;
    }
    
    // If turning off "canView", also turn off "canEdit"
    if (permType === "canView" && !value && existingPerm?.canEdit) {
      newPermissions.canEdit = false;
    }
    
    updateUserPermissions(employee.id, targetUserId, newPermissions);
    setHasChanges(true);
  };
  
  const getUserPermission = (targetUserId: string): { canView: boolean, canEdit: boolean } => {
    const permission = employeePermissions.find(p => p.targetUserId === targetUserId);
    return {
      canView: !!permission?.canView,
      canEdit: !!permission?.canEdit
    };
  };
  
  if (otherUsers.length === 0) {
    return null;
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
                            disabled={!isEditing}
                          />
                          <Label 
                            htmlFor={`view-${user.id}`}
                            className={!isEditing ? "text-muted-foreground" : ""}
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
                            disabled={!isEditing || !userPerm.canView}
                          />
                          <Label 
                            htmlFor={`edit-${user.id}`}
                            className={(!isEditing || !userPerm.canView) ? "text-muted-foreground" : ""}
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
