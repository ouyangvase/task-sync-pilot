
import { Permission } from "./types";
import { PermissionItem } from "./PermissionItem";

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
  if (isEditing) {
    return (
      <div className="space-y-3">
        {permissions.map(permission => (
          <PermissionItem
            key={permission.id}
            permission={permission}
            checked={selectedPermissions.includes(permission.id)}
            onToggle={() => onTogglePermission(permission.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(rolePermissions[employeeRole] || []).map(permId => {
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
