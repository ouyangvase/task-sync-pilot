
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Eye, PencilLine, UserPlus, Trophy, Users, Settings } from "lucide-react";
import { toast } from "sonner";

interface UserPermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User;
  onUpdatePermissions: (permissions: string[]) => void;
}

export function UserPermissionsDialog({ 
  isOpen, 
  onClose, 
  employee, 
  onUpdatePermissions 
}: UserPermissionsDialogProps) {
  // Available permissions
  const availablePermissions = [
    { id: "view_tasks", name: "View Tasks", description: "Can view tasks in the system", icon: <Eye className="h-4 w-4" /> },
    { id: "manage_tasks", name: "Manage Tasks", description: "Can create, edit and delete tasks", icon: <PencilLine className="h-4 w-4" /> },
    { id: "assign_tasks", name: "Assign Tasks", description: "Can assign tasks to users", icon: <UserPlus className="h-4 w-4" /> },
    { id: "complete_tasks", name: "Complete Tasks", description: "Can mark tasks as completed", icon: <CheckCircle2 className="h-4 w-4" /> },
    { id: "view_reports", name: "View Reports", description: "Can view reports and analytics", icon: <Eye className="h-4 w-4" /> },
    { id: "view_employees", name: "View Employees", description: "Can view employees in the system", icon: <Users className="h-4 w-4" /> },
    { id: "edit_employees", name: "Edit Employees", description: "Can edit employee information", icon: <PencilLine className="h-4 w-4" /> },
    { id: "view_achievements", name: "View Achievements", description: "Can view achievements", icon: <Trophy className="h-4 w-4" /> },
    { id: "manage_achievements", name: "Manage Achievements", description: "Can create, edit and delete achievements", icon: <Settings className="h-4 w-4" /> }
  ];

  // Get user custom permissions or use role-based permissions
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    employee.customPermissions || []
  );

  // Update selected permissions when employee changes
  useEffect(() => {
    setSelectedPermissions(employee.customPermissions || []);
  }, [employee]);

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSave = () => {
    onUpdatePermissions(selectedPermissions);
    toast.success(`Permissions updated for ${employee.name}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage User Permissions</DialogTitle>
          <DialogDescription>
            Customize permissions for {employee.name}. These settings will override the default role-based permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[300px] overflow-y-auto pr-2">
          <div className="space-y-4">
            {availablePermissions.map((permission) => (
              <div key={permission.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => handleTogglePermission(permission.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{permission.icon}</span>
                      <Label htmlFor={`permission-${permission.id}`} className="font-medium cursor-pointer">
                        {permission.name}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-4 flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Permissions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
