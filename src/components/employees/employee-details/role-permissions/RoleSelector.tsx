
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types";
import { availableRoles } from "./constants";

interface RoleSelectorProps {
  selectedRole: UserRole;
  isEditing: boolean;
  onRoleChange: (role: string) => void;
}

export function RoleSelector({ selectedRole, isEditing, onRoleChange }: RoleSelectorProps) {
  if (!isEditing) {
    return (
      <div className="bg-muted/50 py-2 px-3 rounded-md capitalize">
        {selectedRole}
      </div>
    );
  }

  return (
    <Select value={selectedRole} onValueChange={onRoleChange}>
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
  );
}
