
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { User, UserRole } from "@/types";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface RolePermissionEditorProps {
  employee: User;
  isAdmin: boolean;
  onUpdateRole: (userId: string, role: string) => void;
}

const availableRoles = [
  { id: "employee", name: "Employee", description: "Regular employee with limited access" },
  { id: "team_lead", name: "Team Lead", description: "Can assign and manage team tasks" },
  { id: "manager", name: "Manager", description: "Department manager with extended access" },
  { id: "admin", name: "Admin", description: "Full system access" }
];

const availablePermissions: Permission[] = [
  { id: "view_tasks", name: "View Tasks", description: "Can view all tasks in the system" },
  { id: "create_tasks", name: "Create Tasks", description: "Can create new tasks" },
  { id: "edit_tasks", name: "Edit Tasks", description: "Can edit existing tasks" },
  { id: "assign_tasks", name: "Assign Tasks", description: "Can assign tasks to others" },
  { id: "view_reports", name: "View Reports", description: "Can view performance reports" },
  { id: "manage_users", name: "Manage Users", description: "Can manage user accounts" }
];

// Default permissions by role
const rolePermissions: Record<string, string[]> = {
  employee: ["view_tasks"],
  team_lead: ["view_tasks", "create_tasks", "edit_tasks", "assign_tasks"],
  manager: ["view_tasks", "create_tasks", "edit_tasks", "assign_tasks", "view_reports"],
  admin: ["view_tasks", "create_tasks", "edit_tasks", "assign_tasks", "view_reports", "manage_users"]
};

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
              <div className="space-y-3">
                {isEditing ? (
                  availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
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
                  ))
                ) : (
                  <div className="space-y-2">
                    {(rolePermissions[employee.role] || []).map(permId => {
                      const permission = availablePermissions.find(p => p.id === permId);
                      return permission ? (
                        <div key={permission.id} className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <span>{permission.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change {employee.name}'s role from{" "}
              <span className="font-medium">{employee.role}</span> to{" "}
              <span className="font-medium">{selectedRole}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-sm">
              This will update their access level and permissions in the system.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSave}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
