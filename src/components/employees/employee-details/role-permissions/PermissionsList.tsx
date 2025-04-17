
import { Permission } from "./types";
import { PermissionItem } from "./PermissionItem";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface PermissionsListProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onTogglePermission: (permissionId: string) => void;
  isEditing: boolean;
  rolePermissions: Record<string, string[]>;
  employeeRole: string;
}

export function PermissionsList({
  permissions,
  selectedPermissions,
  onTogglePermission,
  isEditing,
  rolePermissions,
  employeeRole
}: PermissionsListProps) {
  // Get the permissions for the selected role
  const currentRolePermissions = rolePermissions[employeeRole] || [];

  if (isEditing) {
    return (
      <div className="space-y-3">
        {permissions.map(permission => {
          // Determine which roles have this permission
          const rolesWithPermission = Object.entries(rolePermissions)
            .filter(([_role, perms]) => perms.includes(permission.id))
            .map(([role, _]) => role);
            
          return (
            <div key={permission.id}>
              <PermissionItem
                permission={permission}
                checked={selectedPermissions.includes(permission.id)}
                onToggle={() => onTogglePermission(permission.id)}
              />
              <div className="mt-1 ml-8 flex flex-wrap gap-1">
                {rolesWithPermission.map(role => (
                  <Badge key={role} variant="outline" className="text-xs capitalize">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (currentRolePermissions.length === 0) {
    return (
      <div className="py-3 text-center text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground/70" />
          <p>No permissions assigned to this role</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {currentRolePermissions.map(permId => {
        const permission = permissions.find(p => p.id === permId);
        return permission ? (
          <div key={permission.id} className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <span>{permission.name}</span>
          </div>
        ) : null;
      })}
    </div>
  );
}
