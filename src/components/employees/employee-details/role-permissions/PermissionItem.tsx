
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PermissionItemProps } from "./types";

export function PermissionItem({ permission, checked, onToggle, disabled = false }: PermissionItemProps) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id={`permission-${permission.id}`}
        checked={checked}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
      <div className="grid gap-1">
        <Label
          htmlFor={`permission-${permission.id}`}
          className="cursor-pointer"
        >
          {permission.name}
        </Label>
        <p className="text-sm text-muted-foreground">
          {permission.description}
        </p>
      </div>
    </div>
  );
}
