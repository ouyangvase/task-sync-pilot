
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { RolePermissionEditorProps } from "./types";
import { availableRoles, availablePermissions, rolePermissions } from "./constants";
import { PermissionsList } from "./PermissionsList";
import { ConfirmRoleDialog } from "./ConfirmRoleDialog";

export function RolePermissionEditor({ employee, isAdmin, onUpdateRole }: RolePermissionEditorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(employee.role as UserRole);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    rolePermissions[employee.role] || []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // If not an admin, don't render
  if (!isAdmin) return null;

  const handleRoleChange = (role: string) => {
    setSelectedRole(role as UserRole);
    // When role changes, update permissions to match the default for that role
    setSelectedPermissions(rolePermissions[role] || []);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSave = () => {
    setIsConfirmDialogOpen(true);
  };

  const confirmSave = () => {
    // In a real app, this would save both role and permissions
    onUpdateRole(employee.id, selectedRole);
    
    toast.success(`${employee.name}'s role updated to ${selectedRole}`);
    setIsEditing(false);
    setIsConfirmDialogOpen(false);
  };

  return (
    <>
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Role & Permissions
            </CardTitle>
            <CardDescription>
              Manage employee access level and permissions
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
                  setSelectedRole(employee.role as UserRole);
                  setSelectedPermissions(rolePermissions[employee.role] || []);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">Current Role</p>
              <div className="flex items-center">
                {isEditing ? (
                  <Select value={selectedRole} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="bg-muted/50 py-2 px-3 rounded-md capitalize">
                    {employee.role}
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Permissions</p>
              <PermissionsList 
                permissions={availablePermissions}
                selectedPermissions={selectedPermissions}
                onTogglePermission={handlePermissionToggle}
                isEditing={isEditing}
                rolePermissions={rolePermissions}
                employeeRole={employee.role}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmRoleDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmSave}
        employee={employee}
        selectedRole={selectedRole}
      />
    </>
  );
}
